import type { Problem } from '../types'
import { daysSince, today } from './dates'

// The Comeback Challenge resurfaces one graduated problem per day as a cold
// recall check — the safety net that keeps graduation from silently becoming
// "never seen again". Selection and scoring live here; the schedule/state
// transitions for an outcome live in sm2.ts (resolveComebackSchedule).

const DIFFICULTY_POINTS: Record<Problem['difficulty'], number> = {
  Easy: 10,
  Medium: 20,
  Hard: 30,
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

// Bonus points for acing a comeback: base points by difficulty, nudged up by
// how long the problem had gone unchecked (capped at 1.5x). A comeback earns
// this bonus INSTEAD of the normal per-difficulty review points (the leaderboard
// SQL excludes is_comeback reviews from the base), so it's worth roughly one
// solve plus a small staleness kicker. Tunable.
export function comebackBonus(problem: Problem): number {
  const base = DIFFICULTY_POINTS[problem.difficulty]
  const stalenessMult = Math.min(1.5, 1 + daysSinceLastSeen(problem) / 30)
  return Math.round(base * stalenessMult)
}

// Whether a comeback has already been resolved today (on ANY device) — derived
// from server data, so all devices agree. Resolutions are flagged is_comeback.
export function comebackDoneToday(problems: Problem[]): boolean {
  const t = today()
  return problems.some(p => p.reviews.some(r => r.is_comeback && r.date === t))
}

// Today's comeback: the single most-overdue graduated problem (longest since
// last reviewed), chosen deterministically so every device shows the same one
// with no stored state. An unresolved pick stays the stalest and so persists
// day to day until it's done; resolving it resets its freshness and the next
// stalest surfaces. Returns null when nothing is graduated or one is already
// done today.
export function todaysComeback(problems: Problem[]): Problem | null {
  if (comebackDoneToday(problems)) return null
  const pool = problems.filter(p => p.graduated)
  if (pool.length === 0) return null
  return pool.reduce((best, p) => {
    const d = daysSinceLastSeen(p)
    const bd = daysSinceLastSeen(best)
    if (d > bd) return p
    if (d === bd) return p.id < best.id ? p : best // stable tie-break
    return best
  })
}
