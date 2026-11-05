import type { ImprovementPoint } from '../../types/models';

/** How many distinct sessions a point came up in ("heard N times"). */
export function timesHeard(point: ImprovementPoint): number {
  return new Set(point.sessionIds).size;
}

/**
 * Open points for the home screen: resolved points are dropped, then the most repeated
 * come first, ties broken by newest createdAt. Does not mutate the input.
 */
export function getOpenPointsByRepeats(points: readonly ImprovementPoint[]): ImprovementPoint[] {
  return points
    .filter((point) => point.status === 'open')
    .sort((a, b) => {
      const byRepeats = timesHeard(b) - timesHeard(a);
      if (byRepeats !== 0) return byRepeats;
      const byNewest = Date.parse(b.createdAt) - Date.parse(a.createdAt);
      if (byNewest !== 0) return byNewest;
      return a.id.localeCompare(b.id);
    });
}
