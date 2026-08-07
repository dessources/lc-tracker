interface Props {
  onDismiss: () => void
}

// One-time announcement so returning users understand why review behavior
// changed. Dismissal is persisted (see storage.ts) so it shows only once.
export function WhatsNew({ onDismiss }: Props) {
  return (
    <div className="bg-surface border border-accent/40 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">✨</span>
          <span className="text-xs text-accent uppercase tracking-wider font-medium">What's New</span>
        </div>
        <button
          onClick={onDismiss}
          title="Dismiss"
          className="text-secondary hover:text-primary text-lg leading-none"
        >
          ✕
        </button>
      </div>

      <p className="text-sm text-primary">Reviews used to pile up forever. We fixed that:</p>

      <ul className="text-xs text-secondary space-y-2">
        <li>
          <span className="text-primary font-medium">Problems now graduate.</span>{' '}
          Once you've recalled a problem well enough to space it out to ~a month, it
          leaves your daily queue instead of looping back forever.
        </li>
        <li>
          <span className="text-primary font-medium">A daily review budget.</span>{' '}
          Your queue now shows a finite, most-overdue-first set each day (adjust the
          size in Settings) — no more infinite wall.
        </li>
        <li>
          <span className="text-primary font-medium">The Comeback Challenge.</span>{' '}
          One graduated problem resurfaces each day as a cold-recall check. Ace it for
          bonus points; miss it and it drops back into rotation.
        </li>
      </ul>

      <button
        onClick={onDismiss}
        className="w-full py-2 rounded bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
      >
        Got it
      </button>
    </div>
  )
}
