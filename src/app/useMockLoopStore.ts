import { useState } from 'react';
import { loadData } from '../lib/storage';
import type { MockLoopData } from '../types/models';

/**
 * The app's single store hook, wrapping lib/storage.ts (AGENTS.md §1 State).
 * localStorage is synchronous, so data is loaded in the useState initializer: no loading flash.
 * Write actions are added by the issues that need them (US-1, US-2, US-7).
 */
export function useMockLoopStore(): MockLoopData {
  const [data] = useState<MockLoopData>(loadData);
  return data;
}
