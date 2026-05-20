import type { RecurringRule } from './expandRecurring';

// Three fictional personas sharing a household, designed so that:
//   - riley has events every weekday (school anchors the strip)
//   - jordan covers Mon/Tue/Wed/Fri reliably; Thu is deliberately empty
//   - household is mostly weekends with two weekday-evening events per month
// When combined they paint a believable shared-calendar week with distinct
// densities per persona. Locations are well-known NYC places so the event
// detail view shows recognizable text without leaking real addresses.

export const riley: RecurringRule[] = [
  {
    summary: 'School',
    location: 'P.S. 100',
    startTime: '08:15',
    endTime: '15:00',
    recur: { kind: 'weekly', days: ['MO', 'TU', 'WE', 'TH', 'FR'] },
  },
  {
    summary: 'Art club',
    location: 'P.S. 100',
    startTime: '15:30',
    endTime: '16:30',
    recur: { kind: 'weekly', days: ['TU'] },
  },
  {
    summary: 'Soccer practice',
    location: 'Prospect Park',
    startTime: '17:00',
    endTime: '18:00',
    recur: { kind: 'weekly', days: ['WE'] },
  },
  {
    summary: 'Piano lesson',
    location: 'Lincoln Center',
    startTime: '16:00',
    endTime: '16:45',
    recur: { kind: 'weekly', days: ['TH'] },
  },
  {
    summary: 'Field trip to Bronx Zoo',
    location: 'Bronx Zoo',
    startTime: '09:00',
    endTime: '14:00',
    recur: { kind: 'monthlyNth', nth: 1, weekday: 'TH' },
  },
];

export const jordan: RecurringRule[] = [
  {
    summary: 'Team standup',
    startTime: '09:00',
    endTime: '09:15',
    recur: { kind: 'weekly', days: ['MO', 'WE', 'FR'] },
  },
  {
    summary: '1:1 with manager',
    startTime: '14:00',
    endTime: '14:30',
    recur: { kind: 'weekly', days: ['TU'] },
  },
  {
    summary: 'Therapy',
    startTime: '18:00',
    endTime: '19:00',
    recur: { kind: 'weekly', days: ['WE'], interval: 2 },
  },
  {
    summary: 'Brunch with friends',
    location: 'Tavern on the Green',
    startTime: '11:00',
    endTime: '13:00',
    recur: { kind: 'monthlyNth', nth: 2, weekday: 'SA' },
  },
  {
    summary: 'Volunteer at food bank',
    location: 'Food Bank For New York City',
    startTime: '09:00',
    endTime: '12:00',
    recur: { kind: 'monthlyNth', nth: -1, weekday: 'SU' },
  },
];

export const household: RecurringRule[] = [
  {
    summary: 'Farmers market',
    location: 'Union Square Greenmarket',
    startTime: '09:00',
    endTime: '10:30',
    recur: { kind: 'weekly', days: ['SA'] },
  },
  {
    summary: 'Soccer game',
    location: 'Prospect Park',
    startTime: '10:30',
    endTime: '12:00',
    recur: { kind: 'weekly', days: ['SA'] },
  },
  {
    summary: 'Family dinner',
    startTime: '17:00',
    endTime: '19:00',
    recur: { kind: 'weekly', days: ['SU'] },
  },
  {
    summary: 'Date night',
    location: 'Olive Garden Times Square',
    startTime: '19:00',
    endTime: '22:00',
    recur: { kind: 'monthlyNth', nth: 1, weekday: 'FR' },
  },
  {
    summary: 'Book club',
    startTime: '19:30',
    endTime: '21:00',
    recur: { kind: 'monthlyNth', nth: 3, weekday: 'WE' },
  },
  {
    summary: 'Trash day',
    allDay: true,
    startTime: '00:00',
    endTime: '00:00',
    recur: { kind: 'weekly', days: ['MO'] },
  },
];
