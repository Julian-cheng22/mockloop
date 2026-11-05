import { z } from 'zod';
import {
  CATEGORIES,
  POINT_STATUSES,
  SESSION_TYPES,
  type ImprovementPoint,
  type Session,
} from '../types/models';

const localDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');
const isoTimestamp = z.string().datetime({ offset: true });

export const sessionSchema = z.object({
  id: z.string().min(1),
  date: localDate,
  type: z.enum(SESSION_TYPES),
  partner: z.string().optional(),
  rawNotes: z.string().optional(),
  createdAt: isoTimestamp,
}) satisfies z.ZodType<Session>;

export const improvementPointSchema = z.object({
  id: z.string().min(1),
  text: z.string().trim().min(1),
  category: z.enum(CATEGORIES),
  status: z.enum(POINT_STATUSES),
  sessionIds: z.array(z.string().min(1)),
  practiceAction: z.string().optional(),
  createdAt: isoTimestamp,
  resolvedAt: isoTimestamp.optional(),
}) satisfies z.ZodType<ImprovementPoint>;
