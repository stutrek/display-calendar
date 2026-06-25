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
  const sizeClass = `size-${config.fontSize || 'small'}`;

  if (config.calendars.length === 0) {
    return (
      <HACard class={sizeClass}>
        <div class="card-content calendar-card">
          <div class="calendar-loading">Add a calendar to get started</div>
        </div>
      </HACard>
    );
  }

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
