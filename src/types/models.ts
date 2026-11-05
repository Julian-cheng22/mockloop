// Domain model for MockLoop. Field names and values come from docs/PRD.md §6.
// Keep backward compatible with the localStorage format `mockloop.v1`.

export const SESSION_TYPES = ['Coding', 'Behavioral', 'System design'] as const;
export type SessionType = (typeof SESSION_TYPES)[number];

export const CATEGORIES = [
  'Communication',
  'Problem solving',
  'Code quality',
  'Testing',
  'Time management',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const POINT_STATUSES = ['open', 'resolved'] as const;
export type PointStatus = (typeof POINT_STATUSES)[number];

export interface Session {
  id: string;
  /** Local calendar date, YYYY-MM-DD (never UTC). */
  date: string;
  type: SessionType;
  partner?: string;
  rawNotes?: string;
  /** ISO timestamp. */
  createdAt: string;
}

export interface ImprovementPoint {
  id: string;
  /** Phrased as what happened, e.g. "Went quiet when stuck". */
  text: string;
  category: Category;
  status: PointStatus;
  /** Every session where this feedback came up; length = "heard N times". */
  sessionIds: string[];
  practiceAction?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface MockLoopData {
  sessions: Session[];
  points: ImprovementPoint[];
}
