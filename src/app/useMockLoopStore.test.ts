import { renderHook } from '@testing-library/react';
import { STORAGE_KEY, saveData } from '../lib/storage';
import type { ImprovementPoint } from '../types/models';
import { useMockLoopStore } from './useMockLoopStore';

const point: ImprovementPoint = {
  id: 'p1',
  text: 'Went quiet when stuck',
  category: 'Communication',
  status: 'open',
  sessionIds: ['s1'],
  createdAt: '2026-10-16T01:00:00.000Z',
};

describe('useMockLoopStore', () => {
  it('loads stored data on the first render', () => {
    saveData({ sessions: [], points: [point] });
    const { result } = renderHook(() => useMockLoopStore());
    expect(result.current.points).toEqual([point]);
  });

  it('returns empty lists when nothing is stored', () => {
    const { result } = renderHook(() => useMockLoopStore());
    expect(result.current).toEqual({ sessions: [], points: [] });
  });

  it('returns empty lists for corrupted storage without throwing', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    const { result } = renderHook(() => useMockLoopStore());
    expect(result.current).toEqual({ sessions: [], points: [] });
  });
});
