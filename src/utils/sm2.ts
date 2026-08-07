import type { Problem } from '../types'
import { today, addDays } from './dates'

export interface SM2Result {
  interval: number
  nextReview: string
  easeFactor: number
}

// A problem graduates out of the active review queue once its interval reaches
// this many days. Reaching it means the problem has been recalled correctly
// enough times over ~a month that scheduled review adds no marginal value — it
// moves to the graduated pool and only resurfaces via the Comeback Challenge.
export const GRADUATION_INTERVAL = 30

// Safety ceiling so intervals can grow well past graduation but never run away.
const MAX_INTERVAL = 365

export function graduatesAt(interval: number): boolean {
  return interval >= GRADUATION_INTERVAL
}

export function calculateNextReview(problem: Problem, rating: 1 | 2 | 3 | 4 | 5): SM2Result {
  const isFirstReview = problem.reviews.length === 0
  const prevInterval = problem.interval

  let interval: number
  if (rating < 3) {
    interval = 1
  } else if (rating === 3) {
    interval = 2
  } else if (rating === 4) {
    interval = isFirstReview ? 3 : Math.round(prevInterval * 1.5)
  } else {
    interval = isFirstReview ? 7 : Math.round(prevInterval * 2.5)
  }

  // No 30-day cap: strong recalls grow the interval geometrically so mastered
  // problems space out to months and leave the daily queue (they graduate).
  interval = Math.min(MAX_INTERVAL, Math.max(1, interval))

  const r = rating
  const newEF = Math.max(1.3, problem.ease_factor + (0.1 - (5 - r) * (0.08 + (5 - r) * 0.02)))

  return {
    interval,
    nextReview: addDays(today(), interval),
    easeFactor: Math.round(newEF * 100) / 100,
  }
}

export type ComebackOutcome = 'aced' | 'rusty' | 'failed'

export interface ComebackResolution {
  comfort: 1 | 2 | 3 | 4 | 5
  graduated: boolean
  interval: number
  nextReview: string
}

// How a Comeback Challenge outcome maps back onto the problem's schedule/state.
// Aced   → stays graduated (recalled cold).
// Rusty  → re-enters active review at a gentle 14-day interval, skipping the
//          full re-grind — you basically know it, just need a nearer check.
// Failed → re-enters active with a reset to 1 day; you actually lost it.
export function resolveComebackSchedule(outcome: ComebackOutcome): ComebackResolution {
  if (outcome === 'aced') {
    return { comfort: 5, graduated: true, interval: GRADUATION_INTERVAL, nextReview: addDays(today(), GRADUATION_INTERVAL) }
  }
  if (outcome === 'rusty') {
    return { comfort: 3, graduated: false, interval: 14, nextReview: addDays(today(), 14) }
  }
  return { comfort: 1, graduated: false, interval: 1, nextReview: addDays(today(), 1) }
}
