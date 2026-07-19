import type { CSSProperties } from "react";
import { useState } from "react";
import { DateRangePicker } from "./DateRangePicker";
import type { DateRangeValue } from "./DateRangePicker.types";

const meta = {
  title: "React/DateRangePicker",
  component: DateRangePicker,
  parameters: { layout: "padded" },
};

export default meta;

const stackStyle: CSSProperties = {
  display: "grid",
  gap: "var(--space-5)",
  width: "min(760px, 100%)",
  padding: "var(--space-6)",
};

export const Default = {
  render: () => (
    <div style={stackStyle}>
      <DateRangePicker
        defaultValue={{
          start: new Date(2026, 6, 13),
          end: new Date(2026, 6, 18),
        }}
        clearable
      >
        <DateRangePicker.Label>Travel dates</DateRangePicker.Label>
        <DateRangePicker.Description>
          Select the first and last day of your trip.
        </DateRangePicker.Description>
      </DateRangePicker>
    </div>
  ),
};

export const States = {
  render: () => (
    <div style={stackStyle}>
      <DateRangePicker size="sm" />
      <DateRangePicker size="md" invalid>
        <DateRangePicker.ErrorMessage>
          Choose a valid date range.
        </DateRangePicker.ErrorMessage>
      </DateRangePicker>
      <DateRangePicker size="lg" disabled />
    </div>
  ),
};

export const Controlled = {
  render: function ControlledStory() {
    const [value, setValue] = useState<DateRangeValue>({
      start: new Date(2026, 6, 13),
      end: null,
    });
    return (
      <div style={stackStyle}>
        <DateRangePicker value={value} onValueChange={setValue}>
          <DateRangePicker.Label>Reporting period</DateRangePicker.Label>
        </DateRangePicker>
        <output>
          {value.start?.toLocaleDateString() ?? "—"} /{" "}
          {value.end?.toLocaleDateString() ?? "—"}
        </output>
      </div>
    );
  },
};
