import type { ImprovementPoint, Session } from '../types/models';
import {
  STORAGE_KEY,
  loadData,
  loadPoints,
  loadSessions,
  saveData,
  savePoints,
  saveSessions,
} from './storage';

const session: Session = {
  id: 's1',
  date: '2026-10-15',
  type: 'Coding',
  partner: 'friend',
  rawNotes: 'jumped into code again!! 没问清楚 input',
  createdAt: '2026-10-16T01:00:00.000Z',
};

const point: ImprovementPoint = {
  id: 'p1',
  text: 'Jumped into code without clarifying input',
  category: 'Problem solving',
  status: 'open',
  sessionIds: ['s1'],
  createdAt: '2026-10-16T01:00:00.000Z',
};

describe('storage', () => {
  it('uses the key mockloop.v1', () => {
    expect(STORAGE_KEY).toBe('mockloop.v1');
  });

  it('returns empty lists when nothing is stored', () => {
    expect(loadData()).toEqual({ sessions: [], points: [] });
  });

  it('round-trips sessions and points through save → load', () => {
    expect(saveData({ sessions: [session], points: [point] })).toBe(true);
    expect(loadData()).toEqual({ sessions: [session], points: [point] });
  });

  it('keeps mixed Chinese/English text intact', () => {
    saveSessions([session]);
    expect(loadSessions()[0]?.rawNotes).toBe('jumped into code again!! 没问清楚 input');
  });

  it('saveSessions does not overwrite points, and savePoints does not overwrite sessions', () => {
    saveData({ sessions: [session], points: [point] });
    saveSessions([]);
    expect(loadPoints()).toEqual([point]);
    savePoints([]);
    saveSessions([session]);
    expect(loadData()).toEqual({ sessions: [session], points: [] });
  });

  it('falls back to empty lists on corrupted JSON without throwing', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(() => loadData()).not.toThrow();
    expect(loadData()).toEqual({ sessions: [], points: [] });
  });

  it.each(['null', '42', '"text"', '[]'])('falls back to empty lists for non-object JSON %s', (raw) => {
    localStorage.setItem(STORAGE_KEY, raw);
    expect(loadData()).toEqual({ sessions: [], points: [] });
  });

  it('drops only the invalid records and keeps the valid ones', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        sessions: [session, { ...session, id: 's2', type: 'Lunch' }],
        points: [point, { ...point, id: 'p2', category: 'Vibes' }, { id: 'p3' }],
      }),
    );
    expect(loadData()).toEqual({ sessions: [session], points: [point] });
  });

  it('returns empty lists when localStorage throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(loadData()).toEqual({ sessions: [], points: [] });
    spy.mockRestore();
  });

  it('saveData returns false when storage is full', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(saveData({ sessions: [session], points: [] })).toBe(false);
    spy.mockRestore();
  });
});
