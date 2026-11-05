import { useMemo } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { PointRow } from '../../components/PointRow';
import type { ImprovementPoint } from '../../types/models';
import { heardLabel, sortOpenPoints } from './sortOpenPoints';

interface BeforeNextMockProps {
  points: readonly ImprovementPoint[];
  isLoading?: boolean;
  error?: string | null;
  /** Opens the Log tab from the empty state. */
  onLogMock?: () => void;
  onAddPlan?: (pointId: string) => void;
}

/** Home screen (US-3): open points, most heard first, each with its category and practice plan. */
export function BeforeNextMock({
  points,
  isLoading = false,
  error = null,
  onLogMock,
  onAddPlan,
}: BeforeNextMockProps) {
  const openPoints = useMemo(() => sortOpenPoints(points), [points]);

  return (
    <section aria-labelledby="before-next-mock-heading" aria-busy={isLoading}>
      <h2 id="before-next-mock-heading" className="text-xl font-semibold text-slate-900">
        Before my next mock
      </h2>
      {!isLoading && !error && openPoints.length > 0 ? (
        <p className="mt-1 text-sm text-slate-600">
          {openPoints.length} open {openPoints.length === 1 ? 'point' : 'points'}, most repeated
          first.
        </p>
      ) : null}

      <div className="mt-4">
        {isLoading ? (
          <p role="status" className="text-slate-600">
            Loading your points…
          </p>
        ) : error ? (
          <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">
            {error}
          </p>
        ) : openPoints.length === 0 ? (
          <EmptyState
            message={onLogMock ? 'No open points.' : 'No open points. Log your first mock →'}
            action={
              onLogMock ? (
                <button
                  type="button"
                  onClick={onLogMock}
                  className="min-h-11 rounded-lg bg-indigo-600 px-4 font-medium text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Log your first mock →
                </button>
              ) : undefined
            }
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {openPoints.map((point) => (
              <li key={point.id}>
                <PointRow point={point} heardLabel={heardLabel(point)} onAddPlan={onAddPlan} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
