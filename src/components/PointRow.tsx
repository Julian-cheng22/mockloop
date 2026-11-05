import type { ImprovementPoint } from '../types/models';
import { CategoryChip } from './CategoryChip';

interface PointRowProps {
  point: ImprovementPoint;
  /** Unique sessions the point came up in; "heard N times" is shown when N ≥ 2. */
  timesHeard: number;
  /** Opens the practice plan editor. Optional until editing exists (US-7/US-8). */
  onAddPlan?: (pointId: string) => void;
}

/**
 * Shows a point's text, category chip, "heard N times" and practice plan.
 * Resolve / Reopen / Edit / Delete actions are added with US-7.
 */
export function PointRow({ point, timesHeard, onAddPlan }: PointRowProps) {
  const practiceAction = point.practiceAction?.trim();

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="break-words font-medium text-slate-900">{point.text}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <CategoryChip category={point.category} />
        {timesHeard >= 2 && (
          <span className="text-xs font-semibold text-slate-700">heard {timesHeard} times</span>
        )}
      </div>
      {practiceAction ? (
        <p className="mt-2 break-words text-sm text-slate-700">{practiceAction}</p>
      ) : onAddPlan ? (
        <button
          type="button"
          onClick={() => onAddPlan(point.id)}
          className="mt-1 min-h-11 text-sm font-medium text-indigo-700 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-700"
        >
          + Add a plan
        </button>
      ) : (
        <p className="mt-2 text-sm text-slate-600">+ Add a plan</p>
      )}
    </article>
  );
}
