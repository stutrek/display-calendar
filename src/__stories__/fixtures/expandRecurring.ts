import type { CalendarEventWithSource } from 'preact-homeassistant';

export type Weekday = 'SU' | 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA';

const WEEKDAY_INDEX: Record<Weekday, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

export type Recur =
  | { kind: 'weekly'; days: Weekday[]; interval?: number }
  | { kind: 'monthlyNth'; nth: 1 | 2 | 3 | 4 | -1; weekday: Weekday };

export interface RecurringRule {
  summary: string;
  location?: string;
  description?: string;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  allDay?: boolean;
  recur: Recur;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

// Local-time ISO without timezone — same convention as the existing
// calendar.json (no offset on all-day, offset on timed). We just emit
// floating times; Date parses them as local.
function isoLocal(date: Date, hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m, 0);
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
  );
}

function isoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// For a given (year, month, weekday), return all dates of that weekday in the
// month, in chronological order. Used to resolve "2nd Saturday" / "last Sunday".
function weekdaysInMonth(year: number, month: number, weekday: number): Date[] {
  const out: Date[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    if (d.getDay() === weekday) out.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

function matchesMonthlyNth(date: Date, nth: number, weekday: Weekday): boolean {
  if (date.getDay() !== WEEKDAY_INDEX[weekday]) return false;
  const all = weekdaysInMonth(date.getFullYear(), date.getMonth(), WEEKDAY_INDEX[weekday]);
  const target = nth === -1 ? all[all.length - 1] : all[nth - 1];
  return target?.getDate() === date.getDate();
}

/**
 * Expand a list of recurring rules across a date range into concrete events.
 *
 * For weekly rules with `interval: 2` ("every other Wednesday"), the
 * occurrence parity is anchored to the ISO-week number of the range start,
 * so two stories sharing the same range get the same pattern.
 */
export function expandRecurring(
  rules: RecurringRule[],
  range: { start: Date; end: Date },
  calendarId: `calendar.${string}`,
): CalendarEventWithSource[] {
  const events: CalendarEventWithSource[] = [];

  // Walk midnight-to-midnight, day by day.
  const cursor = new Date(
    range.start.getFullYear(),
    range.start.getMonth(),
    range.start.getDate(),
  );
  const stop = new Date(range.end.getFullYear(), range.end.getMonth(), range.end.getDate());

  while (cursor <= stop) {
    for (const rule of rules) {
      if (!ruleMatches(rule, cursor, range.start)) continue;

      if (rule.allDay) {
        const nextDay = new Date(cursor);
        nextDay.setDate(nextDay.getDate() + 1);
        events.push({
          start: isoDate(cursor),
          end: isoDate(nextDay),
          summary: rule.summary,
          ...(rule.location ? { location: rule.location } : {}),
          ...(rule.description ? { description: rule.description } : {}),
          calendarId,
        });
      } else {
        events.push({
          start: isoLocal(cursor, rule.startTime),
          end: isoLocal(cursor, rule.endTime),
          summary: rule.summary,
          ...(rule.location ? { location: rule.location } : {}),
          ...(rule.description ? { description: rule.description } : {}),
          calendarId,
        });
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return events;
}

function ruleMatches(rule: RecurringRule, date: Date, rangeStart: Date): boolean {
  if (rule.recur.kind === 'weekly') {
    const { days, interval = 1 } = rule.recur;
    if (!days.some((d) => WEEKDAY_INDEX[d] === date.getDay())) return false;
    if (interval === 1) return true;
    // Anchor parity to the range start. Number of whole weeks since
    // (Monday of) the range start.
    const startMon = startOfWeek(rangeStart);
    const dateMon = startOfWeek(date);
    const weeksElapsed = Math.floor((dateMon.getTime() - startMon.getTime()) / (7 * 86400_000));
    return weeksElapsed % interval === 0;
  }
  return matchesMonthlyNth(date, rule.recur.nth, rule.recur.weekday);
}

function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // Treat Monday as week start for parity purposes.
  const dayFromMonday = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dayFromMonday);
  return d;
}
