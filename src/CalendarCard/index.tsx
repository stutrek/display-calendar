import { HACard, registerPreactCard } from 'preact-homeassistant';
import { type CalendarConfig, CalendarProvider, useCalendar } from './CalendarContext';
import { EventList } from './EventList';
import { MonthGrid } from './MonthGrid';
import './DisplayCalendarCard.styles'; // registers card styles
import { CalendarEditorContent } from './DisplayCalendarEditor';

// ============================================================================
// Types
// ============================================================================

interface CardConfig extends CalendarConfig {
  // Additional card config beyond CalendarConfig
}

// ============================================================================
// Preact Components
// ============================================================================

export function CalendarCardInner() {
  const { loading, refreshing } = useCalendar();

  return (
    <>
      {refreshing && !loading && <div class="calendar-refreshing">Checking for updates...</div>}
      <MonthGrid />
      <div class="calendar-divider">
        {loading ? <div class="calendar-loading">Loading...</div> : <EventList />}
      </div>
    </>
  );
}

function CalendarCardContent({ config }: { config: CardConfig }) {
  const sizeClass = `size-${config.fontSize || 'large'}`;

  // With no calendars configured we still render the month grid so the card
  // shows the current month; the event list simply has nothing to show.
  return (
    <CalendarProvider config={config}>
      <HACard class={sizeClass}>
        <div class="card-content calendar-card">
          <CalendarCardInner />
        </div>
      </HACard>
    </CalendarProvider>
  );
}

// ============================================================================
// Register
// ============================================================================

registerPreactCard<CardConfig>({
  type: 'display-calendar',
  name: 'Display Calendar',
  description: 'A calendar card with multi-calendar support and weather',
  Component: CalendarCardContent,
  ConfigComponent: CalendarEditorContent,
  getStubConfig: () => ({ calendars: [] }),
});
