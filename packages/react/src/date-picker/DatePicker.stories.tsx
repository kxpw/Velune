import type { CSSProperties } from "react";
import { useState } from "react";
import { DatePicker } from "./DatePicker";

const meta = {
  title: "React/DatePicker",
  component: DatePicker,
  parameters: { layout: "padded" },
};

export default meta;

const stackStyle: CSSProperties = {
  display: "grid",
  gap: "var(--space-5)",
  width: "min(360px, 100%)",
  padding: "var(--space-6)",
};

const rowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-start",
  gap: "var(--space-4)",
  padding: "var(--space-6)",
};

export const Default = {
  render: () => (
    <div style={stackStyle}>
      <DatePicker defaultValue={new Date(2026, 6, 13)} />
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div style={stackStyle}>
      <DatePicker size="sm" placeholder="Small" />
      <DatePicker size="md" placeholder="Medium" />
      <DatePicker size="lg" placeholder="Large" />
    </div>
  ),
};

export const WithLabel = {
  render: () => (
    <div style={stackStyle}>
      <DatePicker required fullWidth>
        <DatePicker.Label>Start date</DatePicker.Label>
        <DatePicker.Description>
          Dates use your current locale.
        </DatePicker.Description>
      </DatePicker>
      <DatePicker invalid fullWidth>
        <DatePicker.Label>End date</DatePicker.Label>
        <DatePicker.ErrorMessage>
          Choose a date after the start date.
        </DatePicker.ErrorMessage>
      </DatePicker>
    </div>
  ),
};

export const States = {
  render: () => (
    <div style={rowStyle}>
      <DatePicker placeholder="Empty" />
      <DatePicker defaultValue={new Date(2026, 6, 13)} />
      <DatePicker defaultValue={new Date(2026, 6, 13)} readOnly />
      <DatePicker defaultValue={new Date(2026, 6, 13)} disabled />
    </div>
  ),
};

export const Constraints = {
  render: () => (
    <div style={stackStyle}>
      <DatePicker
        defaultOpen
        min={new Date(2026, 6, 10)}
        max={new Date(2026, 6, 24)}
        defaultValue={new Date(2026, 6, 13)}
        fullWidth
      >
        <DatePicker.Label>Booking date</DatePicker.Label>
      </DatePicker>
    </div>
  ),
};

export const Controlled = {
  render: function ControlledStory() {
    const [value, setValue] = useState<Date | null>(new Date(2026, 6, 13));
    return (
      <div style={stackStyle}>
        <DatePicker value={value} onValueChange={setValue} fullWidth>
          <DatePicker.Label>Publish date</DatePicker.Label>
        </DatePicker>
        <output>{value ? value.toLocaleDateString() : "No date"}</output>
      </div>
    );
  },
};

export const RtlCalendar = {
  render: () => (
    <div style={stackStyle} dir="rtl">
      <DatePicker
        defaultValue={new Date(2026, 6, 13)}
        defaultOpen
        locale="ar"
        dir="rtl"
        todayLabel="اليوم"
        previousMonthLabel="الشهر السابق"
        nextMonthLabel="الشهر التالي"
        clearLabel="مسح التاريخ"
        fullWidth
      >
        <DatePicker.Label>تاريخ التسليم</DatePicker.Label>
      </DatePicker>
    </div>
  ),
};
