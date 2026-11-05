import type { ImprovementPoint } from '../../types/models';
import { getOpenPointsByRepeats, timesHeard } from './openPoints';

interface HomeScreenProps {
  points: readonly ImprovementPoint[];
}

function heardLabel(count: number): string {
  return count === 1 ? 'Heard once' : `Heard ${count} times`;
}

/** "Before my next mock": open improvement points, most repeated first (US-3). */
export function HomeScreen({ points }: HomeScreenProps) {
  const openPoints = getOpenPointsByRepeats(points);

  return (
    <section aria-labelledby="home-heading" className="w-full">
      <h2 id="home-heading" className="mb-1 text-xl font-semibold">
        Before my next mock
      </h2>

      {openPoints.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-4 text-slate-700">
          <p className="font-medium">No open points yet.</p>
          <p className="mt-1 text-sm">
            After your next mock interview, log it: paste your notes and the feedback you got
            becomes improvement points that show up here.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-600">
            {openPoints.length === 1
              ? '1 open point to keep in mind'
              : `${openPoints.length} open points to keep in mind`}
          </p>
          <ul aria-label="Open improvement points" className="space-y-3">
            {openPoints.map((point) => {
              const count = timesHeard(point);
              return (
                <li
                  key={point.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
                      {point.category}
                    </span>
                    <span
                      className={
                        count > 1
                          ? 'rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800'
                          : 'text-slate-500'
                      }
                    >
                      {heardLabel(count)}
                    </span>
                  </div>
                  <p className="mt-2 break-words font-medium text-slate-900">{point.text}</p>
                  {point.practiceAction?.trim() ? (
                    <p className="mt-1 break-words text-sm text-slate-600">
                      <span className="font-medium">How I'll practice:</span> {point.practiceAction}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
