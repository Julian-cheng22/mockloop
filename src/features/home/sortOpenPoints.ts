import type { ImprovementPoint } from '../../types/models';

/**
 * Open points for the "Before my next mock" screen (US-3):
 * only `status === 'open'`, most heard first (sessionIds.length desc), then newest first (createdAt desc).
 * Returns a new array; the input is not mutated.
 */
export function sortOpenPoints(points: readonly ImprovementPoint[]): ImprovementPoint[] {
  return points
    .filter((point) => point.status === 'open')
    .sort(
      (a, b) =>
        b.sessionIds.length - a.sessionIds.length ||
        Date.parse(b.createdAt) - Date.parse(a.createdAt),
    );
}

/** "heard N times" label, shown only when a point came up in 2+ sessions. */
export function heardLabel(point: Pick<ImprovementPoint, 'sessionIds'>): string | null {
  const count = point.sessionIds.length;
  return count >= 2 ? `heard ${count} times` : null;
}
