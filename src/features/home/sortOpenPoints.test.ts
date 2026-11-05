import type { ImprovementPoint } from '../../types/models';
import { heardLabel, sortOpenPoints } from './sortOpenPoints';

const makePoint = (overrides: Partial<ImprovementPoint>): ImprovementPoint => ({
  id: 'p',
  text: 'Went quiet when stuck',
  category: 'Communication',
  status: 'open',
  sessionIds: ['s1'],
  createdAt: '2026-10-16T01:00:00.000Z',
  ...overrides,
});

describe('sortOpenPoints', () => {
  it('returns an empty list for empty input', () => {
    expect(sortOpenPoints([])).toEqual([]);
  });

  it('"Shows only open points"', () => {
    const points = [
      makePoint({ id: 'open' }),
      makePoint({ id: 'resolved', status: 'resolved', resolvedAt: '2026-10-17T01:00:00.000Z' }),
    ];
    expect(sortOpenPoints(points).map((p) => p.id)).toEqual(['open']);
  });

  it('returns an empty list when every point is resolved', () => {
    expect(sortOpenPoints([makePoint({ status: 'resolved' })])).toEqual([]);
  });

  it('"Sorted by number of sessions the point came up in"', () => {
    const points = [
      makePoint({ id: 'once', sessionIds: ['s1'] }),
      makePoint({ id: 'thrice', sessionIds: ['s1', 's2', 's3'] }),
      makePoint({ id: 'twice', sessionIds: ['s1', 's2'] }),
    ];
    expect(sortOpenPoints(points).map((p) => p.id)).toEqual(['thrice', 'twice', 'once']);
  });

  it('"then newest first" when heard the same number of times', () => {
    const points = [
      makePoint({ id: 'old', createdAt: '2026-10-01T10:00:00.000Z' }),
      makePoint({ id: 'new', createdAt: '2026-10-15T10:00:00.000Z' }),
      makePoint({ id: 'mid', createdAt: '2026-10-08T10:00:00.000Z' }),
    ];
    expect(sortOpenPoints(points).map((p) => p.id)).toEqual(['new', 'mid', 'old']);
  });

  it('compares timestamps by instant, not by string, across time zone offsets', () => {
    const points = [
      // 2026-10-16T01:00Z
      makePoint({ id: 'earlier', createdAt: '2026-10-15T21:00:00-04:00' }),
      // 2026-10-16T02:00Z
      makePoint({ id: 'later', createdAt: '2026-10-16T02:00:00.000Z' }),
    ];
    expect(sortOpenPoints(points).map((p) => p.id)).toEqual(['later', 'earlier']);
  });

  it('puts times heard before recency', () => {
    const points = [
      makePoint({ id: 'new-once', createdAt: '2026-10-20T10:00:00.000Z' }),
      makePoint({
        id: 'old-twice',
        sessionIds: ['s1', 's2'],
        createdAt: '2026-09-01T10:00:00.000Z',
      }),
    ];
    expect(sortOpenPoints(points).map((p) => p.id)).toEqual(['old-twice', 'new-once']);
  });

  it('does not mutate the input array', () => {
    const points = [makePoint({ id: 'a' }), makePoint({ id: 'b', sessionIds: ['s1', 's2'] })];
    const copy = [...points];
    sortOpenPoints(points);
    expect(points).toEqual(copy);
  });
});

describe('heardLabel', () => {
  it('is null for a point heard once or never', () => {
    expect(heardLabel({ sessionIds: ['s1'] })).toBeNull();
    expect(heardLabel({ sessionIds: [] })).toBeNull();
  });

  it('shows "heard N times" when N ≥ 2', () => {
    expect(heardLabel({ sessionIds: ['s1', 's2'] })).toBe('heard 2 times');
    expect(heardLabel({ sessionIds: ['s1', 's2', 's3'] })).toBe('heard 3 times');
  });
});
