import {
  formatDisplayDate,
  isFutureDate,
  parseLocalDate,
  todayLocal,
  toLocalDateString,
} from './dates';

describe('todayLocal', () => {
  it('returns the local date, not the UTC date, on a US evening', () => {
    // 2026-10-19 02:30 UTC is 2026-10-18 22:30 in New York (test TZ)
    const now = new Date('2026-10-19T02:30:00Z');
    expect(now.toISOString().slice(0, 10)).toBe('2026-10-19'); // the bug AGENTS.md warns about
    expect(todayLocal(now)).toBe('2026-10-18');
  });

  it('pads month and day with zeros', () => {
    expect(toLocalDateString(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('parseLocalDate', () => {
  it('parses YYYY-MM-DD as local midnight', () => {
    const date = parseLocalDate('2026-10-18');
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(9);
    expect(date?.getDate()).toBe(18);
    expect(date?.getHours()).toBe(0);
  });

  it.each(['', '2026-10', '10/18/2026', '2026-02-30', '2026-13-01'])(
    'returns null for invalid input %j',
    (value) => {
      expect(parseLocalDate(value)).toBeNull();
    },
  );
});

describe('isFutureDate', () => {
  const now = new Date(2026, 9, 18, 23, 59);

  it('is false for today and past dates', () => {
    expect(isFutureDate('2026-10-18', now)).toBe(false);
    expect(isFutureDate('2026-10-17', now)).toBe(false);
  });

  it('is true for tomorrow', () => {
    expect(isFutureDate('2026-10-19', now)).toBe(true);
  });
});

describe('formatDisplayDate', () => {
  it('formats like "Sun, Oct 18"', () => {
    expect(formatDisplayDate('2026-10-18')).toBe('Sun, Oct 18');
  });

  it('returns invalid input unchanged', () => {
    expect(formatDisplayDate('not a date')).toBe('not a date');
  });
});
