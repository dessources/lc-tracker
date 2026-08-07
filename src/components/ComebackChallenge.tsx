import type { Problem } from '../types'
import type { ComebackOutcome } from '../utils/sm2'
import { DifficultyBadge } from './DifficultyBadge'
import { PatternTag } from './PatternTag'
import { daysSinceLastSeen, comebackBonus } from '../utils/comeback'

interface Props {
  problem: Problem
  onResolve: (outcome: ComebackOutcome) => void
  // Hide for this session only — does NOT resolve the challenge; it's back
  // next time until an outcome is chosen.
  onHide: () => void
}

const OUTCOMES: { outcome: ComebackOutcome; label: string; hint: string; cls: string }[] = [
  { outcome: 'aced', label: 'Aced it', hint: 'knew it cold', cls: 'text-success border-success/40 bg-success/10 hover:bg-success/20' },
  { outcome: 'rusty', label: 'Rusty', hint: 'got there, slowly', cls: 'text-warning border-warning/40 bg-warning/10 hover:bg-warning/20' },
  { outcome: 'failed', label: 'Failed', hint: 'lost it', cls: 'text-danger border-danger/40 bg-danger/10 hover:bg-danger/20' },
]

export function ComebackChallenge({ problem, onResolve, onHide }: Props) {
  const days = daysSinceLastSeen(problem)
  const bonus = comebackBonus(problem)

  return (
    <div className="bg-surface border border-accent/40 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-accent uppercase tracking-wider font-medium">Comeback Challenge</span>
          <span className="text-xs text-accent/80 font-mono">+{bonus} pts</span>
        </div>
        <button
          onClick={onHide}
          title="Hide for now — it'll be back until you resolve it"
          className="text-secondary hover:text-primary text-lg leading-none"
        >
          ✕
        </button>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          {problem.url ? (
            <a
              href={problem.url}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-sm text-primary hover:text-accent truncate underline decoration-dotted"
            >
              {problem.name}
            </a>
          ) : (
            <span className="font-mono text-sm text-primary truncate">{problem.name}</span>
          )}
          {problem.leetcode_number && (
            <span className="font-mono text-xs text-secondary">#{problem.leetcode_number}</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PatternTag pattern={problem.pattern} />
          <DifficultyBadge difficulty={problem.difficulty} />
          <span className="text-xs text-secondary">last seen {days}d ago</span>
        </div>
      </div>

      <p className="text-xs text-secondary">
        Solve it cold, then tell us how it went.
      </p>

      <div className="grid grid-cols-3 gap-2">
        {OUTCOMES.map(({ outcome, label, hint, cls }) => (
          <button
            key={outcome}
            onClick={() => onResolve(outcome)}
            className={`flex flex-col items-center gap-0.5 border rounded py-2 px-1 text-sm transition-colors ${cls}`}
          >
            <span className="font-medium">{label}</span>
            <span className="text-[10px] opacity-70">{hint}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
