import type { ReactNode } from 'react';

interface EmptyStateProps {
  message: string;
  /** Optional call to action, e.g. a button that opens the Log tab. */
  action?: ReactNode;
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
      <p className="text-slate-700">{message}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
