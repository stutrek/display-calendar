import { css } from 'preact-homeassistant';

export const eventModalStyles = css`
/* The dialog shell — surface, scrim, header, title, and close button — is
   provided by <ha-adaptive-dialog>. These styles only cover the body content
   we slot into it. */

/* Body content — responsive grid.
   Narrow (default, single column): details → map → description, stacked.
   Wide (min-width: 600px): two columns — details + description on the left,
   map spanning both rows on the right. We use grid-template-areas so the
   description (rendered as a sibling of the details column) can slot
   between location and map on narrow screens. */
.event-modal-body {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas:
    "details"
    "map"
    "description";
  gap: 1em;
}

.event-modal-details {
  grid-area: details;
}

.event-modal-map-column {
  grid-area: map;
}

.event-modal-description {
  grid-area: description;
}

@media (min-width: 600px) {
  .event-modal-body {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "details map"
      "description map";
  }
}

/* Left column: event details */
.event-modal-details {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

/* Calendar names */
.event-modal-calendars {
  font-size: 0.875em;
  color: var(--secondary-text-color, #888);
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.event-modal-calendars ha-icon {
  --mdc-icon-size: 1em;
}

/* Time display */
.event-modal-time {
  font-size: 0.875em;
  color: var(--secondary-text-color, #888);
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.event-modal-time ha-icon {
  --mdc-icon-size: 1em;
}

/* Location text */
.event-modal-location-text {
  font-size: 0.875em;
  color: var(--secondary-text-color, #888);
  display: flex;
  align-items: flex-start;
  gap: 0.5em;
}

.event-modal-location-text ha-icon {
  --mdc-icon-size: 1em;
  flex-shrink: 0;
  margin-top: 0.1em;
}

.event-modal-location-address {
  white-space: pre-wrap;
  word-break: break-word;
}

/* Description */
.event-modal-description {
  font-size: 0.875em;
  line-height: 1.5;
  white-space: pre-wrap;
  color: var(--primary-text-color, #fff);
  /* Scale the cap with the viewport so long descriptions get room to breathe
     on large screens, while keeping a sensible floor on small ones. */
  max-height: max(200px, 50vh);
  overflow-y: auto;
  padding: 0.5em;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

/* Right column: map */
.event-modal-map-column {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.25em;
}

/* Re-geocode button - positioned in top-right of map column */
.event-modal-regeocode {
  position: absolute;
  top: 0.25em;
  right: 0.25em;
  z-index: 1;
  background: var(--ha-card-background, var(--card-background-color, #1c1c1c));
  border: none;
  padding: 0.25em;
  cursor: pointer;
  color: var(--secondary-text-color, #888);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.event-modal-regeocode:hover {
  opacity: 1;
  color: var(--primary-text-color, #fff);
  background: rgba(255, 255, 255, 0.2);
}

.event-modal-regeocode:focus {
  outline: 2px solid var(--primary-color, #3b82f6);
  outline-offset: 2px;
  opacity: 1;
}

.event-modal-regeocode ha-icon {
  --mdc-icon-size: 1em;
}

/* Map container */
.event-modal-map-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}

.event-modal-map {
  width: 100%;
  height: 100%;
  border: none;
}

/* Map loading state */
.event-modal-map-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary-text-color, #888);
  font-size: 0.875em;
}

/* Map not found state */
.event-modal-map-not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--secondary-text-color, #888);
  font-size: 0.875em;
  text-align: center;
  padding: 1em;
}

/* Attribution */
.event-modal-attribution {
  font-size: 0.625em;
  color: var(--secondary-text-color, #888);
  text-align: right;
}

.event-modal-attribution a {
  color: inherit;
  text-decoration: underline;
}

/* No-map fallback: drop the map area at every breakpoint so we don't
   leave an empty grid cell on either side of the description. */
.event-modal-body:not(:has(.event-modal-map-column)) {
  grid-template-columns: 1fr;
  grid-template-areas:
    "details"
    "description";
}
`;
