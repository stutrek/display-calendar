import { useCallbackStable } from 'preact-homeassistant';
import { useDarkMode, useHass } from 'preact-homeassistant';
import { type EnrichedEvent, formatTimeRange } from './CalendarContext';
import { LeafletMap } from './LeafletMap';
import { useGeocode } from './useGeocode';
import './EventModal.styles'; // registers styles

// ============================================================================
// Types
// ============================================================================

interface EventModalProps {
  event: EnrichedEvent;
  onClose: () => void;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Format a date for display in the modal
 */
function formatEventDate(event: EnrichedEvent): string {
  const start = new Date(event.start);

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  };

  if (event.isAllDay) {
    return start.toLocaleDateString(undefined, dateOptions);
  }

  const timeRange = formatTimeRange(event.start, event.end);
  return `${start.toLocaleDateString(undefined, dateOptions)} · ${timeRange}`;
}

// ============================================================================
// Component
// ============================================================================

export function EventModal({ event, onClose }: EventModalProps) {
  const { getHass } = useHass();

  // Home location from HA config (read once; rarely changes). Dark mode goes
  // through useDarkMode so the map re-tiles if the theme flips while the modal
  // is open.
  const hass = getHass();
  const homeLat = hass?.config?.latitude;
  const homeLng = hass?.config?.longitude;
  const isDarkMode = useDarkMode();

  // Geocode the event location
  const { lat, lng, loading, notFound, refetch } = useGeocode(event.location);
  // Get calendar names for this event
  const calendarNames = event.calendarIds.map((id) => {
    // Get friendly_name from HA entity, fall back to extracting from entity ID
    const friendlyName = hass?.states[id]?.attributes?.friendly_name;
    return friendlyName ?? id.replace('calendar.', '').replace(/_/g, ' ');
  });

  // Handle re-geocode click
  const handleReGeocode = useCallbackStable(() => {
    refetch();
  });

  const hasLocation = Boolean(event.location);
  const hasCoords = lat !== null && lng !== null;

  return (
    // Reuse HA's own dialog chrome (header, close button, scrim, Escape
    // handling, and the desktop-dialog / mobile-bottom-sheet responsive
    // behavior) instead of hand-rolling a <dialog>. `open` shows it on mount
    // (we only render EventModal while an event is selected); `onclosed` fires
    // when the user dismisses it. The event prop must be lowercase — like
    // `onvalue-changed` in the editor — or Preact won't bind the custom event.
    <ha-adaptive-dialog open header-title={event.summary} width="large" onclosed={onClose}>
      {/* Body. Layout has three grid areas: `details` (calendar / time /
          location), `map`, and `description`. On wide displays they sit
          side by side (details + description on the left, map on the
          right). On narrow displays they stack vertically as
          details → map → description. The description is rendered as a
          sibling of the details column (not inside it) so the grid can
          reorder it independently. */}
      <div class="event-modal-body">
        {/* Event details (top-left on wide, top on narrow) */}
        <div class="event-modal-details">
          {calendarNames.length > 0 && (
            <div class="event-modal-calendars">
              <ha-icon icon="mdi:calendar" />
              <span>{calendarNames.join(', ')}</span>
            </div>
          )}

          <div class="event-modal-time">
            <ha-icon icon="mdi:clock-outline" />
            <span>{formatEventDate(event)}</span>
          </div>

          {hasLocation && (
            <div class="event-modal-location-text">
              <ha-icon icon="mdi:map-marker" />
              <span class="event-modal-location-address">{event.location}</span>
            </div>
          )}
        </div>

        {/* Map (right on wide, between location and description on narrow) */}
        {hasLocation && (
          <div class="event-modal-map-column">
            <button
              class="event-modal-regeocode"
              onClick={handleReGeocode}
              aria-label="Refresh location"
              title="Refresh location"
            >
              <ha-icon icon="mdi:refresh" />
            </button>

            {loading && (
              <div class="event-modal-map-container">
                <div class="event-modal-map-loading">Finding location...</div>
              </div>
            )}

            {!loading && notFound && (
              <div class="event-modal-map-not-found">Could not find on map</div>
            )}

            {!loading && hasCoords && (
              <>
                <div class="event-modal-map-container">
                  <LeafletMap
                    eventLat={lat}
                    eventLng={lng}
                    homeLat={homeLat}
                    homeLng={homeLng}
                    isDarkMode={isDarkMode}
                  />
                </div>
                <div class="event-modal-attribution">
                  ©{' '}
                  <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    OpenStreetMap
                  </a>{' '}
                  ·{' '}
                  <a
                    href="https://carto.com/attributions"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    CARTO
                  </a>
                </div>
              </>
            )}
          </div>
        )}

        {/* Description (bottom-left on wide, bottom on narrow) */}
        {event.description && <div class="event-modal-description">{event.description}</div>}
      </div>
    </ha-adaptive-dialog>
  );
}
