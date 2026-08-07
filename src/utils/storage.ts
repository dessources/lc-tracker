import type { Problem, AppSettings } from '../types'

// Settings stay in localStorage — they're device preferences, not shared data.
// Problem data lives in Supabase now (see api.ts).
const PROBLEMS_KEY = 'lc_tracker_problems'
const SETTINGS_KEY = 'lc_tracker_settings'
// Bump the version suffix to re-announce when there's a new "What's New".
const WHATS_NEW_KEY = 'lc_tracker_whatsnew_v1'
// The single outstanding Comeback Challenge, persisted until resolved.
const COMEBACK_KEY = 'lc_tracker_comeback'

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: true,
  dailyGoal: 5,
  dailyReviewBudget: 15,
}

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    // ignore
  }
  return { ...DEFAULT_SETTINGS }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

// Pre-migration data left on this device, offered for one-time cloud import
export function getLegacyProblems(): Problem[] {
  try {
    const raw = localStorage.getItem(PROBLEMS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed as Problem[]
    }
  } catch {
    // ignore
  }
  return []
}

export function clearLegacyProblems(): void {
  localStorage.removeItem(PROBLEMS_KEY)
}

// ---- One-time "What's New" announcement ----

export function isWhatsNewDismissed(): boolean {
  return localStorage.getItem(WHATS_NEW_KEY) === '1'
}

export function dismissWhatsNew(): void {
  localStorage.setItem(WHATS_NEW_KEY, '1')
}

// ---- Comeback Challenge state ----
// Only one comeback exists at a time. While unresolved it persists across
// sessions/days (never redrawn). Once resolved, `resolved` + `pickedDate` gate
// out a second draw on the same day, so there's at most one per day.

export interface ComebackState {
  problemId: string
  pickedDate: string
  resolved: boolean
}

export function getComebackState(): ComebackState | null {
  try {
    const raw = localStorage.getItem(COMEBACK_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed.problemId === 'string') return parsed as ComebackState
    }
  } catch {
    // ignore
  }
  return null
}

export function setComebackState(c: ComebackState): void {
  localStorage.setItem(COMEBACK_KEY, JSON.stringify(c))
}
