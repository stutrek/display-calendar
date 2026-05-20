import type { Meta, StoryObj } from '@storybook/preact-vite';
import { getAllStyles } from 'preact-homeassistant';
import { CalendarCardInner } from '../CalendarCard';
import {
  type CalendarConfig,
  type CalendarEventWithSource,
  CalendarProvider,
  type FontSize,
  type WeatherForecast,
} from '../CalendarCard/CalendarContext';
// Import component styles to register them
import '../CalendarCard/DisplayCalendarCard.styles';

import { expandRecurring, type RecurringRule } from './fixtures/expandRecurring';
import { household, jordan, riley } from './fixtures/personas';
import hourlyForecast from './weatherForecastHourly.json';

const RILEY_ID = 'calendar.riley' as const;
const JORDAN_ID = 'calendar.jordan' as const;
const HOUSEHOLD_ID = 'calendar.household' as const;

const PERSONAS: Array<{ id: `calendar.${string}`; rules: RecurringRule[] }> = [
  { id: RILEY_ID, rules: riley },
  { id: JORDAN_ID, rules: jordan },
  { id: HOUSEHOLD_ID, rules: household },
];

// Expand each persona's rules ±2 months around the given anchor and
// concatenate. Two-month window keeps the calendar grid fully populated
// across month navigation without generating thousands of events.
function eventsFor(
  personas: Array<{ id: `calendar.${string}`; rules: RecurringRule[] }>,
  anchor: Date,
): CalendarEventWithSource[] {
  const start = new Date(anchor.getFullYear(), anchor.getMonth() - 2, 1);
  const end = new Date(anchor.getFullYear(), anchor.getMonth() + 3, 0);
  return personas.flatMap((p) => expandRecurring(p.rules, { start, end }, p.id));
}

const fullConfig: CalendarConfig = {
  calendars: [
    { entityId: RILEY_ID, color: '#ff6b6b', name: 'Riley' },
    { entityId: JORDAN_ID, color: '#4ecdc4', name: 'Jordan' },
    { entityId: HOUSEHOLD_ID, color: '#ffe66d', name: 'Household' },
  ],
};

function CalendarWidget({
  config,
  events,
  hourlyForecast,
  initialDate,
  fontSize = 'small',
}: {
  config: CalendarConfig;
  events: CalendarEventWithSource[];
  hourlyForecast?: WeatherForecast[];
  initialDate?: Date;
  fontSize?: FontSize;
}) {
  const mergedConfig = { ...config, fontSize };

  return (
    <CalendarProvider
      config={mergedConfig}
      events={events}
      hourlyForecast={hourlyForecast}
      initialDate={initialDate}
    >
      <style>{getAllStyles()}</style>
      <ha-card class={`size-${fontSize}`} style={{ width: '400px' }}>
        <div class="card-content calendar-card">
          <CalendarCardInner />
        </div>
      </ha-card>
    </CalendarProvider>
  );
}

const meta: Meta<typeof CalendarWidget> = {
  title: 'Calendar/CalendarWidget',
  component: CalendarWidget,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#0d0d0d' }],
    },
  },
  argTypes: {
    initialDate: { control: 'date' },
    fontSize: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Calendar size',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CalendarWidget>;

// Three personas overlaid — the primary screenshot story.
const PRIMARY_DATE = new Date(2026, 4, 19);
const primaryEvents = eventsFor(PERSONAS, PRIMARY_DATE);

export const ThreeCalendars: Story = {
  args: {
    config: fullConfig,
    events: primaryEvents,
    hourlyForecast: hourlyForecast as WeatherForecast[],
    initialDate: PRIMARY_DATE,
    fontSize: 'small',
  },
};

// Single-persona views — useful for showing each density signature in isolation.
export const Riley: Story = {
  args: {
    config: { calendars: [fullConfig.calendars[0]] },
    events: eventsFor([PERSONAS[0]], PRIMARY_DATE),
    hourlyForecast: hourlyForecast as WeatherForecast[],
    initialDate: PRIMARY_DATE,
    fontSize: 'small',
  },
};

export const Jordan: Story = {
  args: {
    config: { calendars: [fullConfig.calendars[1]] },
    events: eventsFor([PERSONAS[1]], PRIMARY_DATE),
    hourlyForecast: hourlyForecast as WeatherForecast[],
    initialDate: PRIMARY_DATE,
    fontSize: 'small',
  },
};

export const Household: Story = {
  args: {
    config: { calendars: [fullConfig.calendars[2]] },
    events: eventsFor([PERSONAS[2]], PRIMARY_DATE),
    hourlyForecast: hourlyForecast as WeatherForecast[],
    initialDate: PRIMARY_DATE,
    fontSize: 'small',
  },
};

// 2nd Saturday of May 2026 (the 9th) — brunch + farmers market + soccer game.
export const BusyDay: Story = {
  args: {
    config: fullConfig,
    events: primaryEvents,
    hourlyForecast: hourlyForecast as WeatherForecast[],
    initialDate: new Date(2026, 4, 9),
    fontSize: 'small',
  },
};

export const NoWeather: Story = {
  args: {
    config: fullConfig,
    events: primaryEvents,
    hourlyForecast: undefined,
    initialDate: PRIMARY_DATE,
    fontSize: 'small',
  },
};

export const MediumSize: Story = {
  args: {
    config: fullConfig,
    events: primaryEvents,
    hourlyForecast: hourlyForecast as WeatherForecast[],
    initialDate: PRIMARY_DATE,
    fontSize: 'medium',
  },
};

export const LargeSize: Story = {
  args: {
    config: fullConfig,
    events: primaryEvents,
    hourlyForecast: hourlyForecast as WeatherForecast[],
    initialDate: PRIMARY_DATE,
    fontSize: 'large',
  },
};
