import { useEffect, useState } from 'react';
import { loadData } from '../lib/storage';
import type { MockLoopData } from '../types/models';

export interface MockLoopStore {
  data: MockLoopData;
  isLoading: boolean;
  error: string | null;
}

const EMPTY_DATA: MockLoopData = { sessions: [], points: [] };

/** The single app-wide store hook. Wraps lib/storage.ts; components never touch localStorage. */
export function useMockLoopStore(): MockLoopStore {
  const [store, setStore] = useState<MockLoopStore>({
    data: EMPTY_DATA,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    try {
      setStore({ data: loadData(), isLoading: false, error: null });
    } catch {
      // loadData already falls back on bad data; this guards against anything unexpected.
      setStore({ data: EMPTY_DATA, isLoading: false, error: "Couldn't load your saved points." });
    }
  }, []);

  return store;
}
