import { useCallbackStable } from 'preact-homeassistant';
import { useHass } from 'preact-homeassistant';
import { useEffect, useRef } from 'preact/hooks';
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { getHass } = useHass();

  // Get home location and theme from HA config
  const hass = getHass();
  const homeLat = hass?.config?.latitude;
  const homeLng = hass?.config?.longitude;
  const isDarkMode = hass?.themes?.darkMode ?? false;

  // Geocode the event location
  const { lat, lng, loading, notFound, refetch } = useGeocode(event.location);
  // Get calendar names for this event
  const calendarNames = event.calendarIds.map((id) => {
    // Get friendly_name from HA entity, fall back to extracting from entity ID
    const friendlyName = hass?.states[id]?.attributes?.friendly_name;
    return friendlyName ?? id.replace('calendar.', '').replace(/_/g, ' ');
  });

  // Open dialog on mount
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  // Handle backdrop click to close
  const handleClick = useCallbackStable((e: MouseEvent) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  });

  // Handle dialog close event (from Escape key)
  const handleClose = useCallbackStable(() => {
    onClose();
  });

  // Handle close button click
  const handleCloseClick = useCallbackStable(() => {
    dialogRef.current?.close();
  });

  // Handle re-geocode click
  const handleReGeocode = useCallbackStable(() => {
    refetch();
  });

  const hasLocation = Boolean(event.location);
  const hasCoords = lat !== null && lng !== null;

  return (
    <dialog ref={dialogRef} class="event-modal" onClick={handleClick} onClose={handleClose}>
      <div class="event-modal-content">
        {/* Header */}
        <div class="event-modal-header">
          <h2 class="event-modal-title">{event.summary}</h2>
          <button class="event-modal-close" onClick={handleCloseClick} aria-label="Close">
            <ha-icon icon="mdi:close" />
          </button>
        </div>

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
      </div>
    </dialog>
  );
}
