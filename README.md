# Display Calendar

A Home Assistant custom card designed for wall-mounted displays. Shows a month view with event list, multi-calendar support, and weather integration.

![Display Calendar](https://via.placeholder.com/400x300?text=Screenshot+Coming+Soon)

## Features

- **Month grid view** with navigation and "Today" button
- **Event list** for the selected day with time ranges
- **Multi-calendar support** with configurable colors per calendar
- **Weather integration** showing temperature and conditions for each event
- **Event deduplication** across calendars (shared events show multiple color indicators)
- **Automatic color palette** - colors assigned automatically if not specified

## Installation

### HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Click the three dots menu in the top right corner
3. Select **Custom repositories**
4. Add this repository URL: `https://github.com/stutrek/display-calendar`
5. Select **Dashboard** as the category
6. Click **Add**
7. Search for "Display Calendar" and install it
8. Restart Home Assistant

### Manual Installation

1. Download `display-calendar.js` from the [latest release](https://github.com/stutrek/display-calendar/releases)
2. Copy it to your `config/www/` folder
3. Add the resource in Home Assistant:
   - Go to **Settings** → **Dashboards** → **Resources**
   - Click **Add Resource**
   - URL: `/local/display-calendar.js`
   - Resource type: **JavaScript Module**
4. Restart Home Assistant

## Configuration

Add the card to your dashboard:

```yaml
type: custom:display-calendar
calendars:
  - entityId: calendar.family
    color: '#ff6b6b'
  - entityId: calendar.work
    color: '#4ecdc4'
  - entityId: calendar.school
    # Color auto-assigned from palette if omitted
weatherEntity: weather.home
```

### Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `calendars` | list | Yes | List of calendar configurations |
| `calendars[].entityId` | string | Yes | Calendar entity ID (e.g., `calendar.family`) |
| `calendars[].color` | string | No | Hex color for this calendar (auto-assigned if omitted) |
| `weatherEntity` | string | No | Weather entity ID for event temperature display |

### Default Color Palette

When colors are not specified, calendars are assigned colors from this palette in order:

1. `#ff6b6b` - Coral red
2. `#4ecdc4` - Teal
3. `#ffe66d` - Yellow
4. `#95e1d3` - Mint
5. `#f38181` - Salmon
6. `#aa96da` - Lavender
7. `#fcbad3` - Pink
8. `#a8d8ea` - Sky blue

## Wall Display Tips

This card is optimized for wall-mounted tablets and displays:

- **Kiosk mode**: Use [kiosk-mode](https://github.com/NemesisRE/kiosk-mode) to hide the HA sidebar and header
- **Browser mod**: Use [browser_mod](https://github.com/thomasloven/hass-browser_mod) for display control
- **Screen burn-in**: Consider using a screensaver or dimming schedule for OLED displays

Example dashboard for a dedicated display:

```yaml
views:
  - title: Calendar
    path: calendar
    type: panel
    cards:
      - type: custom:display-calendar
        calendars:
          - entityId: calendar.family
          - entityId: calendar.work
        weatherEntity: weather.home
```

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/stutrek/display-calendar
cd display-calendar
pnpm install
```

### Scripts

```bash
pnpm dev              # vite dev server
pnpm storybook        # storybook on :6006
pnpm test             # vitest run
pnpm build            # produces dist/display-calendar.js
pnpm lint             # biome check
```

### Cross-repo development

This card consumes [preact-homeassistant](https://github.com/stutrek/preact-homeassistant). To develop both together (so connector changes flow straight through), set up a sibling pnpm workspace at `~/Repos/ha-dev/` — see that repo's README for details.

## Technical Notes

This card uses [Preact](https://preactjs.com/) (~3KB) and [preact-homeassistant](https://github.com/stutrek/preact-homeassistant) for hooks (`useEntity`, `useMultiCalendarEvents`, `useWeatherForecast`) and the `registerPreactCard` web-component wrapper. The strict types for `CalendarEntity` / `WeatherEntity` come from the connector's `src/types/`.

## License

MIT
