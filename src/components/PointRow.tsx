import type { ImprovementPoint } from '../types/models';
import { CategoryChip } from './CategoryChip';

interface PointRowProps {
  point: ImprovementPoint;
  /** "heard N times" label, or null to hide it (N < 2). */
  heardLabel: string | null;
  /** When given, points without a practice plan show a "+ Add a plan" button (US-8). */
  onAddPlan?: (pointId: string) => void;
}

/** Presentational row for one improvement point. No data access. */
export function PointRow({ point, heardLabel, onAddPlan }: PointRowProps) {
  const practiceAction = point.practiceAction?.trim();

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <CategoryChip category={point.category} />
        {heardLabel ? (
          <span className="text-xs font-semibold text-indigo-700">{heardLabel}</span>
        ) : null}
      </div>
      <h3 className="mt-2 break-words text-base font-medium text-slate-900">{point.text}</h3>
      {practiceAction ? (
        <p className="mt-1 break-words text-sm text-slate-600">
          <span className="font-medium text-slate-700">How I'll practice: </span>
          {practiceAction}
        </p>
      ) : onAddPlan ? (
        <button
          type="button"
          onClick={() => onAddPlan(point.id)}
          className="mt-1 min-h-11 text-sm font-medium text-indigo-700 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          + Add a plan
        </button>
      ) : null}
    </article>
  );
}
