import { describe, expect, it } from 'vitest';
import { type RecurringRule, expandRecurring } from './expandRecurring';

const CAL = 'calendar.test' as const;

// May 2026 is a clean test window: starts on a Friday, ends on a Sunday.
const MAY_2026 = { start: new Date(2026, 4, 1), end: new Date(2026, 4, 31) };

describe('expandRecurring', () => {
  it('expands a weekly multi-day rule across the range', () => {
    const rules: RecurringRule[] = [
      {
        summary: 'Standup',
        startTime: '09:00',
        endTime: '09:15',
        recur: { kind: 'weekly', days: ['MO', 'WE', 'FR'] },
      },
    ];
    const events = expandRecurring(rules, MAY_2026, CAL);
    // May 2026: Fridays 1,8,15,22,29 (5); Mondays 4,11,18,25 (4); Weds 6,13,20,27 (4) = 13
    expect(events).toHaveLength(13);
    expect(new Set(events.map((e) => new Date(e.start).getDay()))).toEqual(new Set([1, 3, 5]));
  });

  it('honors interval: 2 for every-other-week rules', () => {
    const rules: RecurringRule[] = [
      {
        summary: 'Therapy',
        startTime: '18:00',
        endTime: '19:00',
        recur: { kind: 'weekly', days: ['WE'], interval: 2 },
      },
    ];
    const events = expandRecurring(rules, MAY_2026, CAL);
    // 4 Wednesdays in May, every other = 2.
    expect(events).toHaveLength(2);
    const dates = events.map((e) => new Date(e.start).getDate());
    expect(dates[1] - dates[0]).toBe(14);
  });

  it('resolves monthlyNth with positive nth', () => {
    const rules: RecurringRule[] = [
      {
        summary: 'Brunch',
        startTime: '11:00',
        endTime: '13:00',
        recur: { kind: 'monthlyNth', nth: 2, weekday: 'SA' },
      },
    ];
    const events = expandRecurring(rules, MAY_2026, CAL);
    expect(events).toHaveLength(1);
    expect(events[0].start.startsWith('2026-05-09')).toBe(true); // 2nd Sat of May 2026
  });

  it('resolves monthlyNth with nth: -1 (last occurrence)', () => {
    const rules: RecurringRule[] = [
      {
        summary: 'Volunteer',
        startTime: '09:00',
        endTime: '12:00',
        recur: { kind: 'monthlyNth', nth: -1, weekday: 'SU' },
      },
    ];
    const events = expandRecurring(rules, MAY_2026, CAL);
    expect(events).toHaveLength(1);
    expect(events[0].start.startsWith('2026-05-31')).toBe(true); // last Sun of May
  });

  it('emits all-day events with date-only strings spanning one day', () => {
    const rules: RecurringRule[] = [
      {
        summary: 'Trash day',
        allDay: true,
        startTime: '00:00',
        endTime: '00:00',
        recur: { kind: 'weekly', days: ['MO'] },
      },
    ];
    const events = expandRecurring(rules, MAY_2026, CAL);
    expect(events).toHaveLength(4);
    expect(events[0].start).toBe('2026-05-04'); // first Mon
    expect(events[0].end).toBe('2026-05-05'); // exclusive next-day
  });

  it('tags emitted events with the calendarId', () => {
    const rules: RecurringRule[] = [
      {
        summary: 'Anything',
        startTime: '09:00',
        endTime: '10:00',
        recur: { kind: 'weekly', days: ['MO'] },
      },
    ];
    const events = expandRecurring(rules, MAY_2026, 'calendar.riley');
    expect(events.every((e) => e.calendarId === 'calendar.riley')).toBe(true);
  });
});
