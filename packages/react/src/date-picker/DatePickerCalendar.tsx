import { memo } from "react";
import {
  datePickerDayClasses,
  datePickerFooterClasses,
  datePickerRowClasses,
  datePickerTodayClasses,
} from "./DatePicker.classes";

export type DatePickerDayMetadata = {
  date: Date;
  key: string;
  outside: boolean;
  today: boolean;
  disabled: boolean;
  label: string;
  setRef: (node: HTMLButtonElement | null) => void;
};

type DatePickerDayProps = {
  metadata: DatePickerDayMetadata;
  selected: boolean;
  focused: boolean;
  tabStop: boolean;
  onSelect: (date: Date) => void;
  onFocus: (date: Date) => void;
};

const DatePickerDay = memo(function DatePickerDay({
  metadata,
  selected,
  focused,
  tabStop,
  onSelect,
  onFocus,
}: DatePickerDayProps) {
  const { date } = metadata;

  return (
    <button
      ref={metadata.setRef}
      type="button"
      role="gridcell"
      className={datePickerDayClasses}
      tabIndex={tabStop ? 0 : -1}
      disabled={metadata.disabled}
      aria-label={metadata.label}
      aria-selected={selected}
      data-outside={metadata.outside ? "true" : undefined}
      data-selected={selected ? "true" : undefined}
      data-today={metadata.today ? "true" : undefined}
      data-focused={focused ? "true" : undefined}
      onClick={() => onSelect(date)}
      onFocus={() => onFocus(date)}
    >
      {date.getDate()}
    </button>
  );
});

type DatePickerWeekProps = {
  days: readonly DatePickerDayMetadata[];
  selectedKey: string;
  focusedKey: string;
  tabStopKey: string;
  onSelect: (date: Date) => void;
  onFocus: (date: Date) => void;
};

export const DatePickerWeek = memo(
  function DatePickerWeek({
    days,
    selectedKey,
    focusedKey,
    tabStopKey,
    onSelect,
    onFocus,
  }: DatePickerWeekProps) {
    return (
      <div className={datePickerRowClasses} role="row">
        {days.map((metadata) => (
          <DatePickerDay
            key={metadata.key}
            metadata={metadata}
            selected={metadata.key === selectedKey}
            focused={metadata.key === focusedKey}
            tabStop={metadata.key === tabStopKey}
            onSelect={onSelect}
            onFocus={onFocus}
          />
        ))}
      </div>
    );
  },
  (previous, next) => {
    if (
      previous.days !== next.days ||
      previous.onSelect !== next.onSelect ||
      previous.onFocus !== next.onFocus
    ) {
      return false;
    }

    return !next.days.some(({ key }) => {
      const wasSelected = key === previous.selectedKey;
      const isSelected = key === next.selectedKey;
      const wasFocused = key === previous.focusedKey;
      const isFocused = key === next.focusedKey;
      const wasTabStop = key === previous.tabStopKey;
      const isTabStop = key === next.tabStopKey;
      return (
        wasSelected !== isSelected ||
        wasFocused !== isFocused ||
        wasTabStop !== isTabStop
      );
    });
  },
);

export const DatePickerCalendarFooter = memo(function DatePickerCalendarFooter({
  todayLabel,
  disabled,
  onSelectToday,
}: {
  todayLabel: string;
  disabled: boolean;
  onSelectToday: () => void;
}) {
  return (
    <div className={datePickerFooterClasses}>
      <button
        type="button"
        className={datePickerTodayClasses}
        disabled={disabled}
        onClick={onSelectToday}
      >
        {todayLabel}
      </button>
    </div>
  );
});
