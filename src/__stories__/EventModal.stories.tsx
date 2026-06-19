import type { Meta, StoryObj } from '@storybook/preact-vite';
import { HAProvider, getAllStyles } from 'preact-homeassistant';
import type { EnrichedEvent } from '../CalendarCard/CalendarContext';
import { EventModal } from '../CalendarCard/EventModal';
// Register component styles (EventModal also imports these, but be explicit).
import '../CalendarCard/EventModal.styles';
import { createMockHass, noopSubscribe } from '../__test-utils__/mockHass';

// Home location so the map renders a "home" marker alongside the event pin.
const mockHass = {
  ...createMockHass({
    entities: {
      'calendar.riley': {
        entity_id: 'calendar.riley',
        state: 'on',
        attributes: { friendly_name: 'Riley' },
      },
    },
  }),
  config: { latitude: 37.7749, longitude: -122.4194 } as any,
};

const baseEvent: EnrichedEvent = {
  start: '2026-05-19T15:00:00',
  end: '2026-05-19T16:30:00',
  summary: 'Dentist Appointment',
  description: 'Routine cleaning. Bring the insurance card and arrive 10 minutes early.',
  location: '1 Dr Carlton B Goodlett Pl, San Francisco, CA 94102',
  colors: ['#ff6b6b'],
  calendarIds: ['calendar.riley'],
  isAllDay: false,
};

function Preview({ event }: { event: EnrichedEvent }) {
  return (
    <HAProvider hass={mockHass} subscribeToEntity={noopSubscribe}>
      <style>{getAllStyles()}</style>
      <EventModal event={event} onClose={() => {}} />
    </HAProvider>
  );
}

const meta: Meta<typeof Preview> = {
  title: 'Calendar/EventModal',
  component: Preview,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#0d0d0d' }],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Preview>;

// With a location: two-column layout (details + description left, map right).
// The map geocodes via Nominatim, so it may briefly show "Finding location...".
export const WithLocation: Story = {
  args: { event: baseEvent },
};

// No location: single-column layout, no map, no network dependency.
export const NoLocation: Story = {
  args: {
    event: {
      ...baseEvent,
      location: undefined,
      description: 'No location set for this event.',
    },
  },
};
