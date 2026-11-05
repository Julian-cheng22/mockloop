import type { ImprovementPoint } from '../../types/models';
import { getOpenPointsByRepeats, timesHeard } from './openPoints';

const makePoint = (overrides: Partial<ImprovementPoint> & { id: string }): ImprovementPoint => ({
  text: `Point ${overrides.id}`,
  category: 'Communication',
  status: 'open',
  sessionIds: ['s1'],
  createdAt: '2026-10-01T12:00:00.000Z',
  ...overrides,
});

describe('timesHeard', () => {
  it('counts distinct sessions', () => {
    expect(timesHeard(makePoint({ id: 'p', sessionIds: ['s1', 's2', 's1'] }))).toBe(2);
  });

  it('is 0 when there are no sessions', () => {
    expect(timesHeard(makePoint({ id: 'p', sessionIds: [] }))).toBe(0);
  });
});

describe('getOpenPointsByRepeats', () => {
  it('returns an empty list for no points', () => {
    expect(getOpenPointsByRepeats([])).toEqual([]);
  });

  it('drops resolved points', () => {
    const points = [
      makePoint({ id: 'open' }),
      makePoint({ id: 'done', status: 'resolved', resolvedAt: '2026-10-05T12:00:00.000Z' }),
    ];
    expect(getOpenPointsByRepeats(points).map((p) => p.id)).toEqual(['open']);
  });

  it('sorts by number of sessions, most repeated first', () => {
    const points = [
      makePoint({ id: 'once', sessionIds: ['s1'] }),
      makePoint({ id: 'thrice', sessionIds: ['s1', 's2', 's3'] }),
      makePoint({ id: 'twice', sessionIds: ['s1', 's2'] }),
    ];
    expect(getOpenPointsByRepeats(points).map((p) => p.id)).toEqual(['thrice', 'twice', 'once']);
  });

  it('breaks ties by newest createdAt first', () => {
    const points = [
      makePoint({ id: 'old', createdAt: '2026-09-01T12:00:00.000Z' }),
      makePoint({ id: 'new', createdAt: '2026-10-20T12:00:00.000Z' }),
      makePoint({ id: 'mid', createdAt: '2026-10-01T12:00:00.000Z' }),
    ];
    expect(getOpenPointsByRepeats(points).map((p) => p.id)).toEqual(['new', 'mid', 'old']);
  });

  it('compares timestamps by instant, not string, across offsets', () => {
    const points = [
      // 2026-10-02T01:00Z
      makePoint({ id: 'later', createdAt: '2026-10-01T21:00:00-04:00' }),
      makePoint({ id: 'earlier', createdAt: '2026-10-01T23:00:00.000Z' }),
    ];
    expect(getOpenPointsByRepeats(points).map((p) => p.id)).toEqual(['later', 'earlier']);
  });

  it('does not count duplicate session ids as extra repeats', () => {
    const points = [
      makePoint({
        id: 'dupes',
        sessionIds: ['s1', 's1', 's1'],
        createdAt: '2026-10-20T12:00:00.000Z',
      }),
      makePoint({ id: 'two', sessionIds: ['s1', 's2'], createdAt: '2026-09-01T12:00:00.000Z' }),
    ];
    expect(getOpenPointsByRepeats(points).map((p) => p.id)).toEqual(['two', 'dupes']);
  });

  it('does not mutate the input array', () => {
    const points = [makePoint({ id: 'a' }), makePoint({ id: 'b', sessionIds: ['s1', 's2'] })];
    const copy = [...points];
    getOpenPointsByRepeats(points);
    expect(points).toEqual(copy);
  });
});
