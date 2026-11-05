import { useMemo } from 'react';
import { PointRow } from '../../components/PointRow';
import type { ImprovementPoint } from '../../types/models';
import { sortOpenPoints, timesHeard } from './sortOpenPoints';

interface BeforeNextMockProps {
  points: readonly ImprovementPoint[];
  /** Goes to the Log tab. Optional until the Log screen exists (#4). */
  onLogFirstMock?: () => void;
  /** Opens the practice plan editor for a point. Optional until editing exists. */
  onAddPlan?: (pointId: string) => void;
}

const EMPTY_TEXT = 'No open points. Log your first mock →';

/** Home screen (US-3): open points only, most repeated first, then newest first. */
export function BeforeNextMock({ points, onLogFirstMock, onAddPlan }: BeforeNextMockProps) {
  const openPoints = useMemo(() => sortOpenPoints(points), [points]);

  return (
    <section aria-labelledby="before-next-mock-heading">
      <h2 id="before-next-mock-heading" className="mb-4 text-xl font-semibold text-slate-900">
        Before my next mock
      </h2>
      {openPoints.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
          {onLogFirstMock ? (
            <button
              type="button"
              onClick={onLogFirstMock}
              className="min-h-11 font-medium text-indigo-700 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-700"
            >
              {EMPTY_TEXT}
            </button>
          ) : (
            <p className="text-slate-700">{EMPTY_TEXT}</p>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {openPoints.map((point) => (
            <li key={point.id}>
              <PointRow point={point} timesHeard={timesHeard(point)} onAddPlan={onAddPlan} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
