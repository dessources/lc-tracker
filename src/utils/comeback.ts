import type { Problem } from '../types'
import { daysSince } from './dates'

// The Comeback Challenge resurfaces one graduated problem per day as a cold
// recall check — the safety net that keeps graduation from silently becoming
// "never seen again". Selection and scoring live here; the schedule/state
// transitions for an outcome live in sm2.ts (resolveComebackSchedule).

const DIFFICULTY_POINTS: Record<Problem['difficulty'], number> = {
  Easy: 10,
  Medium: 20,
  Hard: 30,
}

const DIFFICULTY_WEIGHT: Record<Problem['difficulty'], number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
}

// Days since the problem was last reviewed (its freshness). Older = staler =
// more valuable to re-check. Falls back to date_added if it somehow has no
// reviews (shouldn't happen for a graduated problem).
export function daysSinceLastSeen(problem: Problem): number {
  const last = problem.reviews.length > 0
    ? problem.reviews[problem.reviews.length - 1].date
    : problem.date_added
  return Math.max(0, daysSince(last))
}

// Bonus points for acing a comeback: base points by difficulty scaled up by how
// long the problem had gone unchecked (capped at 3x). Tunable.
export function comebackBonus(problem: Problem): number {
  const base = DIFFICULTY_POINTS[problem.difficulty]
  const stalenessMult = Math.min(3, 1 + daysSinceLastSeen(problem) / 30)
  return Math.round(base * stalenessMult)
}

// Draw weight for the daily pick: staler and harder problems surface first, so
// nothing in the graduated pool rots indefinitely.
function drawWeight(problem: Problem): number {
  return Math.max(1, daysSinceLastSeen(problem)) * DIFFICULTY_WEIGHT[problem.difficulty]
}

// Pick one graduated problem, weighted by staleness x difficulty. Returns null
// when the graduated pool is empty.
export function pickComeback(problems: Problem[]): Problem | null {
  const pool = problems.filter(p => p.graduated)
  if (pool.length === 0) return null

  const weights = pool.map(drawWeight)
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i]
    if (r <= 0) return pool[i]
  }
  return pool[pool.length - 1]
}
