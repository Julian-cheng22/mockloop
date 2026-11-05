import type { ImprovementPoint } from '../../types/models';
import { sortOpenPoints, timesHeard } from './sortOpenPoints';

const makePoint = (overrides: Partial<ImprovementPoint> & { id: string }): ImprovementPoint => ({
  text: `Point ${overrides.id}`,
  category: 'Communication',
  status: 'open',
  sessionIds: ['s1'],
  createdAt: '2026-10-10T12:00:00.000Z',
  ...overrides,
});

describe('timesHeard', () => {
  it('counts unique session ids', () => {
    expect(timesHeard(makePoint({ id: 'p1', sessionIds: ['s1', 's2', 's3'] }))).toBe(3);
  });

  it('ignores duplicate session ids', () => {
    expect(timesHeard(makePoint({ id: 'p1', sessionIds: ['s1', 's1', 's2'] }))).toBe(2);
  });

  it('is 0 for a point with no sessions', () => {
    expect(timesHeard(makePoint({ id: 'p1', sessionIds: [] }))).toBe(0);
  });
});

describe('sortOpenPoints', () => {
  it('returns an empty list for empty input', () => {
    expect(sortOpenPoints([])).toEqual([]);
  });

  it('shows only open points', () => {
    const points = [
      makePoint({ id: 'open' }),
      makePoint({ id: 'resolved', status: 'resolved', resolvedAt: '2026-10-12T12:00:00.000Z' }),
    ];
    expect(sortOpenPoints(points).map((p) => p.id)).toEqual(['open']);
  });

  it('returns an empty list when every point is resolved', () => {
    expect(sortOpenPoints([makePoint({ id: 'p1', status: 'resolved' })])).toEqual([]);
  });

  it('sorts by number of sessions ("heard N times"), most repeated first', () => {
    const points = [
      makePoint({ id: 'once', sessionIds: ['s1'] }),
      makePoint({ id: 'thrice', sessionIds: ['s1', 's2', 's3'] }),
      makePoint({ id: 'twice', sessionIds: ['s1', 's2'] }),
    ];
    expect(sortOpenPoints(points).map((p) => p.id)).toEqual(['thrice', 'twice', 'once']);
  });

  it('breaks ties by newest first (createdAt desc)', () => {
    const points = [
      makePoint({ id: 'old', createdAt: '2026-10-01T12:00:00.000Z' }),
      makePoint({ id: 'new', createdAt: '2026-10-15T12:00:00.000Z' }),
      makePoint({ id: 'mid', createdAt: '2026-10-08T12:00:00.000Z' }),
    ];
    expect(sortOpenPoints(points).map((p) => p.id)).toEqual(['new', 'mid', 'old']);
  });

  it('counts duplicate session ids once when sorting', () => {
    const points = [
      makePoint({ id: 'dupes', sessionIds: ['s1', 's1', 's1'] }),
      makePoint({ id: 'two', sessionIds: ['s1', 's2'], createdAt: '2026-10-01T12:00:00.000Z' }),
    ];
    expect(sortOpenPoints(points).map((p) => p.id)).toEqual(['two', 'dupes']);
  });

  it('does not mutate the input array', () => {
    const points = [makePoint({ id: 'a' }), makePoint({ id: 'b', sessionIds: ['s1', 's2'] })];
    const copy = [...points];
    sortOpenPoints(points);
    expect(points).toEqual(copy);
  });
});
