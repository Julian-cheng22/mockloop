import { improvementPointSchema, sessionSchema } from './schemas';

const validSession = {
  id: 's1',
  date: '2026-10-15',
  type: 'Behavioral',
  createdAt: '2026-10-16T01:00:00.000Z',
};

const validPoint = {
  id: 'p1',
  text: 'Went quiet when stuck',
  category: 'Communication',
  status: 'open',
  sessionIds: ['s1', 's2'],
  createdAt: '2026-10-16T01:00:00.000Z',
};

describe('sessionSchema', () => {
  it('accepts a valid session with optional fields omitted', () => {
    expect(sessionSchema.safeParse(validSession).success).toBe(true);
  });

  it('rejects an unknown session type', () => {
    expect(sessionSchema.safeParse({ ...validSession, type: 'Lunch' }).success).toBe(false);
  });

  it('rejects a date that is not YYYY-MM-DD', () => {
    expect(sessionSchema.safeParse({ ...validSession, date: '10/15/2026' }).success).toBe(false);
  });
});

describe('improvementPointSchema', () => {
  it('accepts a valid point', () => {
    expect(improvementPointSchema.safeParse(validPoint).success).toBe(true);
  });

  it('accepts all 5 categories and rejects others', () => {
    for (const category of [
      'Communication',
      'Problem solving',
      'Code quality',
      'Testing',
      'Time management',
    ]) {
      expect(improvementPointSchema.safeParse({ ...validPoint, category }).success).toBe(true);
    }
    expect(improvementPointSchema.safeParse({ ...validPoint, category: 'Vibes' }).success).toBe(
      false,
    );
  });

  it('rejects empty or whitespace-only text', () => {
    expect(improvementPointSchema.safeParse({ ...validPoint, text: '   ' }).success).toBe(false);
  });

  it('rejects an unknown status', () => {
    expect(improvementPointSchema.safeParse({ ...validPoint, status: 'done' }).success).toBe(false);
  });
});
