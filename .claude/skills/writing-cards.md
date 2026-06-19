---
name: writing-cards
description: Patterns and conventions for building Home Assistant cards with preact-homeassistant. Trigger when adding a new card, a new widget, an editor, hooks, styles, or registering a custom element for HA.
---

# Writing a card with preact-homeassistant

This template builds Home Assistant Lovelace cards as Preact components. Every
card boils down to one call to `registerPreactCard` plus a `Component` and an
optional `ConfigComponent`.

## Required structure

```
src/MyCard/
├── index.tsx          # imports `registerPreactCard` and calls it (side-effect entry)
├── MyCard.tsx         # the Component that renders inside <ha-card>
├── MyCard.styles.ts   # css`` tagged template, imported as a side effect from MyCard.tsx
└── MyCardEditor.tsx   # optional ConfigComponent for the visual editor
```

The Vite build entry must point at `index.tsx`. Top-level side-effects in
`index.tsx` register the custom element with the browser.

Splitting the Component into its own `MyCard.tsx` is optional — `fan-card` does,
but `display-calendar` and `display-weather` define the Component directly in
`index.tsx` alongside the `registerPreactCard` call. Either is fine; for a small
card, keeping it in `index.tsx` is less ceremony.

## The Component

- Wrap the card body in `<ha-card>`. HA's CSS expects this wrapper for borders/elevation.
- Put any padding inside `<div class="card-content">` (HA convention).
- Read entities with `useEntity(entityId)`. The return type is narrowed by domain:
  - `useEntity('calendar.x')` → `CalendarEntity`
  - `useEntity('weather.x')` → `WeatherEntity`
  - `useEntity('sun.sun')` → `SunEntity`
  - other domains → `HassEntity` (loose).
- For one-off service calls, use `const { getHass } = useHass()` then `getHass()?.callService(...)`. This does NOT re-render on entity changes.
- For multi-entity data, use `useMultiCalendarEvents` / `useWeatherForecast` / `useCachedFetch`.

## The ConfigComponent (visual editor)

- Receives `{ hass, config, onConfigChanged }`.
- Renders into the **light DOM**, not the shadow root (HA's own form elements need this).
- Prefer HA's `<ha-form hass data schema>` driven by a schema of **selectors**
  over assembling inputs by hand — HA renders the right control for each field
  (entity picker with search, dropdown, boolean toggle, …) and you supply labels
  and help text via `computeLabel` / `computeHelper`. For a field that doesn't
  fit a form row (e.g. a per-row entity picker beside a color input), drop down
  to a standalone `<ha-selector hass selector value>`.
- Read changes from the **lowercase** `onvalue-changed` event
  (`(e) => e.detail.value`) and commit with `onConfigChanged({ ...config, ...next })`.
  Lowercase for the same custom-element reason as `onclosed` (see Dialogs and overlays).
- Avoid the older `<ha-select>` + `<ha-list-item>` pattern: current HA replaced
  ha-select's internals (ha-dropdown / wa-popup), so arbitrary `<ha-list-item>`
  children no longer participate in selection — clicks fire `request-selected`
  but `value` never updates.
- Reference implementation: `CalendarCard/DisplayCalendarEditor.tsx`.

## Styles

- Write CSS in a `MyCard.styles.ts` file using the `css\`\`` tagged template from `preact-homeassistant`.
- Import that file as a side-effect from `MyCard.tsx`: `import './MyCard.styles';`
- Styles register globally; `registerPreactCard` injects all registered styles into each card's shadow root on render.
- Use HA CSS variables for theming: `--primary-text-color`, `--secondary-text-color`, `--card-background-color`, `--primary-color`, `--ha-card-background`, etc.

## Storybook + tests

- For tests/stories, wrap the component in `<HAProvider hass={mockHass} subscribeToEntity={noopSubscribe}>`. Pass `noopSubscribe` by reference — it *is* the subscribe function; calling it (`noopSubscribe()`) hands `HAProvider` the unsubscribe fn instead.
- Use `createMockHass({ entities })` and `noopSubscribe` from `src/__test-utils__/mockHass.ts`.
- Import `src/__test-utils__/ha-stubs.ts` once (already done in `.storybook/preview.ts` and `vitest` setup) so `<ha-card>` etc. don't throw "unknown element" errors.

## Dialogs and overlays

Need a modal or detail popup? Reuse Home Assistant's own `<ha-adaptive-dialog>`
instead of hand-rolling a `<dialog>`. It ships in HA's core bundle (registered
on a fresh dashboard load, so it's safe to render straight from a card) and
gives you the native Material chrome, scrim, Escape handling, and an automatic
desktop-dialog → mobile-bottom-sheet switch — none of which you have to style or
maintain.

- Open it with the `open` attribute; set `header-title`, `width`, etc.
- Handle dismissal with the **lowercase** `onclosed` prop: `onclosed={onClose}`.
  Custom-element events only bind when the `on*` prop is all-lowercase — same
  reason the editor uses `onvalue-changed`, not `onValueChanged`. `onClosed`
  silently never fires.
- Declare it in `src/jsx.d.ts` and add a stub in `__test-utils__/ha-stubs.ts`
  so it renders in Storybook/tests (HA's real element isn't present outside HA).
- Reference implementation: `CalendarCard/EventModal.tsx`.

To check whether some other HA element is available to a card, run
`customElements.get('ha-thing')` in the browser console on a fresh dashboard
load — if it returns a constructor, you can use it; if it's lazy-loaded
(`undefined` until HA opens something that uses it), you can't rely on it.

## The Shadow DOM gotcha

The Component renders inside the card's shadow root. Anything that escapes the
shadow root won't be styled by your `css\`\`` (modals, portals, etc.). If you
need full-document overlay UI that HA doesn't already provide (prefer
`ha-adaptive-dialog` for modals — see above), render it into `document.body`
from a `useEffect` hook rather than inside the card tree.

## Don't

- Don't import React or react-dom. Preact-only.
- Don't bundle `home-assistant-js-websocket` types into your card's `.js`; they're erased at compile time.
- Don't add `console.log` for debugging in the published build — strip them before tagging a release.
- Don't render the editor into the shadow root. Use light DOM.
- Don't hand-roll a `<dialog>` for modals — reuse `ha-adaptive-dialog` (see Dialogs and overlays).

## Pattern: stub config

```ts
registerPreactCard<MyConfig>({
  type: 'my-card',
  name: 'My Card',
  description: '...',
  Component: MyCard,
  ConfigComponent: MyCardEditor,
  getStubConfig: () => ({ entity: '' }),
});
```

`getStubConfig` is what HA inserts when the user adds the card from the picker
without going through the editor. Keep it minimal but valid.
