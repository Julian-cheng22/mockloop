// The ONLY module that touches localStorage (AGENTS.md §1 Key patterns).
import type { ImprovementPoint, MockLoopData, Session } from '../types/models';
import { improvementPointSchema, sessionSchema } from './schemas';

export const STORAGE_KEY = 'mockloop.v1';

const emptyData = (): MockLoopData => ({ sessions: [], points: [] });

/** Keeps the records that pass validation and drops the rest, so one bad record can't wipe the list. */
function parseList<T>(raw: unknown, parse: (item: unknown) => T | null): T[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    const parsed = parse(item);
    return parsed ? [parsed] : [];
  });
}

const parseSession = (item: unknown): Session | null => {
  const result = sessionSchema.safeParse(item);
  return result.success ? result.data : null;
};

const parsePoint = (item: unknown): ImprovementPoint | null => {
  const result = improvementPointSchema.safeParse(item);
  return result.success ? result.data : null;
};

/** Loads all data. Missing, corrupted or unreadable storage falls back to empty lists. */
export function loadData(): MockLoopData {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return emptyData();
  }
  if (!raw) return emptyData();

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return emptyData();
  }
  if (typeof json !== 'object' || json === null) return emptyData();

  const record = json as Record<string, unknown>;
  return {
    sessions: parseList(record.sessions, parseSession),
    points: parseList(record.points, parsePoint),
  };
}

/** Saves all data. Returns false if storage is unavailable (private mode, quota). */
export function saveData(data: MockLoopData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export const loadSessions = (): Session[] => loadData().sessions;
export const loadPoints = (): ImprovementPoint[] => loadData().points;

export function saveSessions(sessions: Session[]): boolean {
  return saveData({ ...loadData(), sessions });
}

export function savePoints(points: ImprovementPoint[]): boolean {
  return saveData({ ...loadData(), points });
}
