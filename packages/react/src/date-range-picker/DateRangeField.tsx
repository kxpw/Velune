import type { KeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { serializeDate } from "../date-picker/date-picker-utils";
import {
  dateRangePickerInputClasses,
  dateRangePickerLiteralClasses,
  dateRangePickerSegmentClasses,
} from "./DateRangePicker.classes";

type SegmentType = "year" | "month" | "day";

type DraftValue = Record<SegmentType, number | null>;

type SegmentPart =
  | { kind: "segment"; type: SegmentType }
  | { kind: "literal"; text: string };

const SEGMENT_MAX: Record<SegmentType, number> = {
  year: 9999,
  month: 12,
  day: 31,
};

const SEGMENT_MIN: Record<SegmentType, number> = {
  year: 1,
  month: 1,
  day: 1,
};

const SEGMENT_PLACEHOLDER: Record<SegmentType, string> = {
  year: "yyyy",
  month: "mm",
  day: "dd",
};

const SEGMENT_NAME: Record<SegmentType, string> = {
  year: "year",
  month: "month",
  day: "day",
};

function getSegmentParts(locale: string): SegmentPart[] {
  const formatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts: SegmentPart[] = [];
  for (const part of formatter.formatToParts(new Date(2026, 11, 31))) {
    if (part.type === "year" || part.type === "month" || part.type === "day") {
      parts.push({ kind: "segment", type: part.type });
    } else if (part.type === "literal") {
      parts.push({ kind: "literal", text: part.value });
    }
  }
  return parts;
}

function draftFromDate(date: Date | null): DraftValue {
  return date
    ? {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
      }
    : { year: null, month: null, day: null };
}

function draftToDate(draft: DraftValue): Date | null {
  if (draft.year == null || draft.month == null || draft.day == null) {
    return null;
  }
  const daysInMonth = new Date(draft.year, draft.month, 0).getDate();
  return new Date(
    draft.year,
    draft.month - 1,
    Math.min(draft.day, daysInMonth),
  );
}

export type DateRangeFieldProps = {
  value: Date | null;
  onCommit: (date: Date | null) => void;
  /** Accessible name prefix, e.g. `Start date`. */
  fieldLabel: string;
  locale: string;
  disabled: boolean;
  readOnly: boolean;
};

/**
 * A segmented date field: one spinbutton per year/month/day segment ordered
 * by the locale's date pattern. Commits a full Date once every segment has a
 * value, and commits null when a previously complete value is cleared.
 */
export function DateRangeField({
  value,
  onCommit,
  fieldLabel,
  locale,
  disabled,
  readOnly,
}: DateRangeFieldProps) {
  const parts = useMemo(() => getSegmentParts(locale), [locale]);
  const [draft, setDraft] = useState<DraftValue>(() => draftFromDate(value));
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const valueKey = serializeDate(value);
  const lastCommittedRef = useRef(valueKey);

  useEffect(() => {
    if (lastCommittedRef.current !== valueKey) {
      lastCommittedRef.current = valueKey;
      setDraft(draftFromDate(value));
    }
  }, [value, valueKey]);

  const applyDraft = (next: DraftValue) => {
    setDraft(next);
    const nextDate = draftToDate(next);
    const nextKey = serializeDate(nextDate);
    if (nextKey === lastCommittedRef.current) return;
    // Only commit complete dates, or a clear of a previously complete value.
    if (nextDate !== null || lastCommittedRef.current !== "") {
      lastCommittedRef.current = nextKey;
      onCommit(nextDate);
    }
  };

  const moveFocus = (from: HTMLElement, direction: 1 | -1) => {
    const segments = Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>('[role="spinbutton"]') ??
        [],
    );
    const index = segments.indexOf(from);
    segments[index + direction]?.focus();
  };

  const handleKeyDown = (
    type: SegmentType,
    event: KeyboardEvent<HTMLSpanElement>,
  ) => {
    if (disabled) return;
    const { key } = event;
    if (key === "ArrowLeft" || key === "ArrowRight") {
      event.preventDefault();
      moveFocus(event.currentTarget, key === "ArrowRight" ? 1 : -1);
      return;
    }
    if (readOnly) return;
    const current = draft[type];
    const min = SEGMENT_MIN[type];
    const max = SEGMENT_MAX[type];

    if (key === "ArrowUp" || key === "ArrowDown") {
      event.preventDefault();
      const offset = key === "ArrowUp" ? 1 : -1;
      const base =
        current ??
        (type === "year"
          ? new Date().getFullYear()
          : key === "ArrowUp"
            ? min - 1
            : max + 1);
      let next = base + offset;
      if (type !== "year") {
        if (next > max) next = min;
        if (next < min) next = max;
      } else {
        next = Math.min(max, Math.max(min, next));
      }
      applyDraft({ ...draft, [type]: next });
      return;
    }
    if (key === "Backspace" || key === "Delete") {
      event.preventDefault();
      const next = current == null ? null : Math.floor(current / 10) || null;
      applyDraft({ ...draft, [type]: next });
      return;
    }
    if (/^\d$/.test(key)) {
      event.preventDefault();
      const digit = Number(key);
      let next = (current ?? 0) * 10 + digit;
      if (next > max) next = digit;
      applyDraft({ ...draft, [type]: next === 0 ? null : next });
      if (next > 0 && next * 10 > max) {
        moveFocus(event.currentTarget, 1);
      }
    }
  };

  return (
    <span ref={rootRef} className={dateRangePickerInputClasses}>
      {parts.map((part, index) => {
        if (part.kind === "literal") {
          return (
            <span
              key={`literal-${index}`}
              aria-hidden="true"
              className={dateRangePickerLiteralClasses}
            >
              {part.text}
            </span>
          );
        }
        const segmentValue = draft[part.type];
        const text =
          segmentValue == null
            ? SEGMENT_PLACEHOLDER[part.type]
            : String(segmentValue).padStart(part.type === "year" ? 4 : 2, "0");
        return (
          <span
            key={part.type}
            role="spinbutton"
            tabIndex={disabled ? -1 : 0}
            inputMode="numeric"
            aria-label={`${fieldLabel} ${SEGMENT_NAME[part.type]}`}
            aria-valuemin={SEGMENT_MIN[part.type]}
            aria-valuemax={SEGMENT_MAX[part.type]}
            {...(segmentValue != null
              ? { "aria-valuenow": segmentValue, "aria-valuetext": text }
              : { "aria-valuetext": "Empty" })}
            {...(disabled ? { "aria-disabled": true } : {})}
            {...(readOnly ? { "aria-readonly": true } : {})}
            className={dateRangePickerSegmentClasses({
              empty: segmentValue == null,
              disabled,
            })}
            onKeyDown={(event) => handleKeyDown(part.type, event)}
          >
            {text}
          </span>
        );
      })}
    </span>
  );
}
