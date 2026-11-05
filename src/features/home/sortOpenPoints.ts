import type { ImprovementPoint } from '../../types/models';

/** "Heard N times" = number of unique sessions the point came up in (sessionIds is a set). */
export function timesHeard(point: ImprovementPoint): number {
  return new Set(point.sessionIds).size;
}

/**
 * Open points only, most repeated first (unique sessions desc), then newest first (createdAt desc).
 * Returns a new array; the input is not mutated.
 */
export function sortOpenPoints(points: readonly ImprovementPoint[]): ImprovementPoint[] {
  return points
    .filter((point) => point.status === 'open')
    .sort((a, b) => {
      const byTimesHeard = timesHeard(b) - timesHeard(a);
      if (byTimesHeard !== 0) return byTimesHeard;
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });
}
