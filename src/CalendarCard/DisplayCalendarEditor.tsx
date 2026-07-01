import type { HomeAssistant } from 'preact-homeassistant';
import { useCallbackStable } from 'preact-homeassistant';
import { useEffect, useState } from 'preact/hooks';
import {
  type CalendarConfig,
  type CalendarConfigItem,
  DEFAULT_COLORS,
  type FontSize,
} from './CalendarContext';

interface EditorProps {
  hass: HomeAssistant;
  config: CalendarConfig;
  onConfigChanged: (config: CalendarConfig) => void;
}

// Top-level fields go through <ha-form> with HA selectors. The calendars list
// needs per-row color customization that doesn't map cleanly onto a single
// selector, so we render those rows ourselves using <ha-selector> for each
// row's entity picker (HA renders the proper picker with search + icons).
//
// Avoid the older <ha-select>+<ha-list-item> pattern — current HA replaced
// ha-select's internals (ha-dropdown / wa-popup) and arbitrary list-item
// children no longer participate in selection.
const TOP_SCHEMA = [
  {
    name: 'weatherEntity',
    selector: { entity: { domain: 'weather' } },
  },
  {
    name: 'fontSize',
    selector: {
      select: {
        mode: 'dropdown',
        options: [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' },
        ],
      },
    },
  },
  {
    name: 'showCalendar',
    selector: { boolean: {} },
  },
  {
    name: 'hidePastEvents',
    selector: { boolean: {} },
  },
] as const;

const TOP_LABELS: Record<string, string> = {
  weatherEntity: 'Weather entity (optional)',
  fontSize: 'Font size',
  showCalendar: 'Show calendar grid',
  hidePastEvents: 'Hide past events',
};

const TOP_HELPERS: Record<string, string> = {
  showCalendar: 'When off, the ‹ › buttons move one day at a time.',
  hidePastEvents: 'When on, already-ended events are hidden when viewing today.',
};

const calendarSelector = { entity: { domain: 'calendar' } };

function CalendarEditorContent({ hass, config, onConfigChanged }: EditorProps) {
  const [calendars, setCalendars] = useState<CalendarConfigItem[]>(config.calendars ?? []);

  useEffect(() => {
    const incoming = config.calendars ?? [];
    setCalendars((prev) => {
      // config only ever holds fully-selected calendars (empty rows are filtered
      // out before persisting). If the incoming config just reflects our own
      // edit, keep the local list so in-progress empty rows the user is still
      // filling in aren't wiped. Otherwise config changed externally — adopt it.
      const prevValid = prev.filter((cal) => cal.entityId?.startsWith('calendar.'));
      const mirrorsOurEdit =
        incoming.length === prevValid.length &&
        incoming.every(
          (cal, i) => cal.entityId === prevValid[i].entityId && cal.color === prevValid[i].color,
        );
      return mirrorsOurEdit ? prev : incoming;
    });
  }, [config]);

  const fireConfigChanged = useCallbackStable(
    (next: Partial<CalendarConfig>, nextCalendars?: CalendarConfigItem[]) => {
      const validCalendars = (nextCalendars ?? calendars).filter((cal) =>
        cal.entityId?.startsWith('calendar.'),
      );
      onConfigChanged({
        ...config,
        ...next,
        calendars: validCalendars,
      });
    },
  );

  const handleTopChanged = useCallbackStable((e: Event) => {
    const next = (e as CustomEvent).detail?.value as Partial<CalendarConfig> | undefined;
    if (!next) return;
    const weatherEntity =
      typeof next.weatherEntity === 'string' && next.weatherEntity.startsWith('weather.')
        ? (next.weatherEntity as `weather.${string}`)
        : undefined;
    fireConfigChanged({
      weatherEntity,
      fontSize: next.fontSize as FontSize,
      showCalendar: next.showCalendar !== false,
      hidePastEvents: next.hidePastEvents === true,
    });
  });

  const addCalendar = useCallbackStable(() => {
    const newCalendars = [
      ...calendars,
      {
        entityId: '' as `calendar.${string}`,
        color: DEFAULT_COLORS[calendars.length % DEFAULT_COLORS.length],
      },
    ];
    setCalendars(newCalendars);
  });

  const removeCalendar = useCallbackStable((index: number) => {
    const newCalendars = calendars.filter((_, i) => i !== index);
    setCalendars(newCalendars);
    fireConfigChanged({}, newCalendars);
  });

  const updateCalendarEntity = useCallbackStable((index: number, entityId: string) => {
    const newCalendars = calendars.map((cal, i) =>
      i === index ? { ...cal, entityId: entityId as `calendar.${string}` } : cal,
    );
    setCalendars(newCalendars);
    fireConfigChanged({}, newCalendars);
  });

  const updateCalendarColor = useCallbackStable((index: number, color: string) => {
    const newCalendars = calendars.map((cal, i) => (i === index ? { ...cal, color } : cal));
    setCalendars(newCalendars);
    fireConfigChanged({}, newCalendars);
  });

  const computeLabel = useCallbackStable(
    (schema: { name: string }) => TOP_LABELS[schema.name] ?? schema.name,
  );

  const computeHelper = useCallbackStable(
    (schema: { name: string }) => TOP_HELPERS[schema.name] ?? '',
  );

  // The data fed to <ha-form>: only top-level fields, not the calendars array.
  // showCalendar undefined is treated as true to match the rendered card.
  const topData = {
    weatherEntity: config.weatherEntity,
    fontSize: config.fontSize ?? 'large',
    showCalendar: config.showCalendar !== false,
    hidePastEvents: config.hidePastEvents === true,
  };

  // With no calendars configured, the card can't show anything, so the only
  // meaningful action is to add one. Hide every other setting behind that CTA.
  if (calendars.length === 0) {
    return (
      <div class="editor">
        <style>{editorStyles}</style>
        <div class="empty-state">
          <div class="empty-state__text">Add a calendar to get started.</div>
          <button class="cta-btn" type="button" onClick={addCalendar}>
            + Add Calendar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div class="editor">
      <style>{editorStyles}</style>

      <div class="section">
        <div class="section-header">
          <span>Calendars</span>
        </div>

        {calendars.map((cal, index) => (
          <div class="calendar-row" key={index}>
            <div class="calendar-row__picker">
              <ha-selector
                hass={hass}
                selector={calendarSelector}
                value={cal.entityId}
                onvalue-changed={(e: Event) => {
                  const v = (e as CustomEvent).detail?.value;
                  updateCalendarEntity(index, typeof v === 'string' ? v : '');
                }}
              />
            </div>
            <input
              type="color"
              class="color-picker"
              value={cal.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              onChange={(e) => updateCalendarColor(index, (e.target as HTMLInputElement).value)}
            />
            <button class="remove-btn" type="button" onClick={() => removeCalendar(index)}>
              ×
            </button>
          </div>
        ))}

        <div class="calendar-row calendar-row--add">
          <button class="add-btn" type="button" onClick={addCalendar}>
            + Add Calendar
          </button>
        </div>
      </div>

      <div class="section">
        <ha-form
          hass={hass}
          data={topData}
          schema={TOP_SCHEMA}
          computeLabel={computeLabel}
          computeHelper={computeHelper}
          onvalue-changed={handleTopChanged}
        />
      </div>
    </div>
  );
}

const editorStyles = `
  .editor {
    padding: 16px;
    font-family: var(--primary-font-family, Roboto, system-ui, sans-serif);
  }

  .section {
    margin-bottom: 24px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 32px 16px;
    text-align: center;
  }

  .empty-state__text {
    color: var(--secondary-text-color);
    font-size: 14px;
  }

  .cta-btn {
    background: var(--primary-color);
    color: var(--text-primary-color);
    border: none;
    border-radius: 4px;
    padding: 12px 24px;
    cursor: pointer;
    font-size: 15px;
    font-weight: 500;
  }

  .cta-btn:hover {
    opacity: 0.9;
  }

  .calendar-row--add {
    justify-content: flex-start;
  }

  .add-btn {
    background: var(--primary-color);
    color: var(--text-primary-color);
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 13px;
    width: 100%;
  }

  .add-btn:hover {
    opacity: 0.9;
  }

  .calendar-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .calendar-row__picker {
    flex: 1;
  }

  .color-picker {
    width: 40px;
    height: 40px;
    padding: 0;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background: none;
  }

  .color-picker::-webkit-color-swatch-wrapper {
    padding: 2px;
  }

  .color-picker::-webkit-color-swatch {
    border-radius: 4px;
    border: 1px solid var(--divider-color);
  }

  .remove-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 4px;
    background: var(--error-color, #db4437);
    color: white;
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .remove-btn:hover {
    opacity: 0.9;
  }
`;

export { CalendarEditorContent };
