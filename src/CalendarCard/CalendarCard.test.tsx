import { describe, expect, it } from 'vitest';

// Smoke test: the card module side-effects register a custom element.
describe('CalendarCard registration', () => {
  it('registers the display-calendar custom element on import', async () => {
    await import('./index');
    expect(customElements.get('display-calendar')).toBeDefined();
  });
});
