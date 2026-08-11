import { useState, useCallback, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Problem, Review } from '../types'
import * as api from '../utils/api'
import { calculateNextReview, graduatesAt, resolveComebackSchedule } from '../utils/sm2'
import type { ComebackOutcome } from '../utils/sm2'
import { comebackBonus } from '../utils/comeback'
import { today } from '../utils/dates'
import { useAuth } from '../contexts/AuthContext'

export interface NewProblemData {
  name: string
  leetcode_number?: number
  url?: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  pattern: Problem['pattern']
  subpattern?: string
  source: 'LeetCode' | 'Codeforces' | 'Other'
  notes?: string
  initialComfort: 1 | 2 | 3 | 4 | 5
}

export function useProblems() {
  const { session } = useAuth()
  const userId = session?.user.id
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!userId) return
    try {
      setProblems(await api.fetchProblems())
      setError(null)
    } catch (e: any) {
      setError(e.message ?? 'Failed to load problems')
    }
  }, [userId])

  useEffect(() => {
    if (!userId) {
      setProblems([])
      setLoading(false)
      return
    }
    setLoading(true)
    refetch().finally(() => setLoading(false))
  }, [userId, refetch])

  // Optimistic update: apply locally, write to Supabase, refetch on failure
  const mutate = useCallback((updated: Problem[], write: () => Promise<void>) => {
    setProblems(updated)
    write().catch(e => {
      setError(e.message ?? 'Save failed — reloading')
      refetch()
    })
  }, [refetch])

  const addProblem = useCallback((data: NewProblemData) => {
    if (!userId) return
    const stub: Problem = {
      id: uuidv4(),
      name: data.name,
      leetcode_number: data.leetcode_number,
      url: data.url,
      difficulty: data.difficulty,
      pattern: data.pattern,
      subpattern: data.subpattern,
      source: data.source,
      date_added: today(),
      notes: data.notes,
      reviews: [],
      next_review: today(),
      interval: 0,
      ease_factor: 2.5,
      comfort_history: [],
      graduated: false,
    }
    const { interval, nextReview, easeFactor } = calculateNextReview(stub, data.initialComfort)
    const problem: Problem = {
      ...stub,
      interval,
      next_review: nextReview,
      ease_factor: easeFactor,
      comfort_history: [data.initialComfort],
      reviews: [{ date: today(), comfort: data.initialComfort }],
    }
    mutate([...problems, problem], () => api.insertProblem(problem, userId))
    return problem
  }, [problems, userId, mutate])

  const updateProblem = useCallback((id: string, updates: Partial<Omit<Problem, 'id'>>) => {
    const updated = problems.map(p => p.id === id ? { ...p, ...updates } : p)
    mutate(updated, () => api.updateProblem(id, updates))
  }, [problems, mutate])

  const deleteProblem = useCallback((id: string) => {
    mutate(problems.filter(p => p.id !== id), () => api.deleteProblem(id))
  }, [problems, mutate])

  const logReview = useCallback((
    id: string,
    comfort: 1 | 2 | 3 | 4 | 5,
    time_spent_minutes?: number,
    notes?: string,
  ) => {
    if (!userId) return
    const problem = problems.find(p => p.id === id)
    if (!problem) return

    const review: Review = { date: today(), comfort, time_spent_minutes, notes }
    const { interval, nextReview, easeFactor } = calculateNextReview(problem, comfort)
    // A strong recall that pushes the interval past the graduation threshold
    // retires the problem from the active queue into the graduated pool.
    const graduated = graduatesAt(interval)

    const updated: Problem = {
      ...problem,
      reviews: [...problem.reviews, review],
      interval,
      next_review: nextReview,
      ease_factor: easeFactor,
      comfort_history: [...problem.comfort_history, comfort],
      graduated,
    }
    mutate(
      problems.map(p => p.id === id ? updated : p),
      () => api.insertReview(id, userId, review, {
        interval,
        next_review: nextReview,
        ease_factor: easeFactor,
        graduated,
      })
    )
  }, [problems, userId, mutate])

  // Resolve the daily Comeback Challenge for a graduated problem.
  const resolveComeback = useCallback((id: string, outcome: ComebackOutcome) => {
    if (!userId) return
    const problem = problems.find(p => p.id === id)
    if (!problem) return

    const { comfort, graduated, interval, nextReview } = resolveComebackSchedule(outcome)
    const bonus = outcome === 'aced' ? comebackBonus(problem) : 0
    const review: Review = { date: today(), comfort, is_comeback: true }

    const updated: Problem = {
      ...problem,
      reviews: [...problem.reviews, review],
      interval,
      next_review: nextReview,
      comfort_history: [...problem.comfort_history, comfort],
      graduated,
    }
    mutate(
      problems.map(p => p.id === id ? updated : p),
      () => api.resolveComeback(id, userId, review, bonus, {
        graduated,
        interval,
        next_review: nextReview,
      })
    )
  }, [problems, userId, mutate])

  const importProblems = useCallback(async (imported: Problem[]) => {
    if (!userId) return
    await api.bulkImport(imported, userId)
    await refetch()
  }, [userId, refetch])

  return { problems, loading, error, addProblem, updateProblem, deleteProblem, logReview, resolveComeback, importProblems, refetch }
}
