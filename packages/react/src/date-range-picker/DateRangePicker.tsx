import type { CalendarDate } from "@internationalized/date";
import { CalendarDate as InternationalizedCalendarDate } from "@internationalized/date";
import type { ForwardedRef, ReactNode } from "react";
import {
  forwardRef,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
} from "react";
import { useControllableState } from "@velune/hooks";
import {
  Button as AriaButton,
  DateInput,
  DateRangePicker as AriaDateRangePicker,
  DateSegment,
  Group,
  I18nProvider,
  Label,
} from "react-aria-components";
import { clsx } from "clsx";
import { serializeDate } from "../date-picker/date-picker-utils";
import { toDateValue } from "../date-picker/date-utils";
import {
  collectCompoundSlotProps,
  createCompoundSlot,
} from "../shared/compound-slot";
import { useComposedRefs } from "../shared/compose-refs";
import {
  inputDescriptionClasses,
  inputErrorClasses,
  inputFieldClasses,
  inputLabelClasses,
  inputLabelSizeClasses,
  inputRequiredClasses,
} from "../shared/input-tailwind-classes";
import type {
  DateRangeInput,
  DateRangePickerDescriptionProps,
  DateRangePickerErrorMessageProps,
  DateRangePickerLabelProps,
  DateRangePickerProps,
  DateRangeValue,
} from "./DateRangePicker.types";

const fieldSizeClasses = {
  sm: "[--gs-drp-box:var(--input-height-sm)] [--gs-drp-inline:var(--space-2)] px-[var(--gs-drp-inline)] text-gs-input-font-size-sm",
  md: "[--gs-drp-box:var(--input-height-md)] [--gs-drp-inline:var(--space-3)] px-[var(--gs-drp-inline)] text-gs-input-font-size",
  lg: "[--gs-drp-box:var(--input-height-lg)] [--gs-drp-inline:var(--space-4)] px-[var(--gs-drp-inline)] text-gs-input-font-size-lg",
} as const;

const iconButtonClasses =
  "m-0 inline-flex size-gs-control-hit-target shrink-0 cursor-pointer items-center justify-center rounded-gs-sm border-0 bg-transparent p-0 text-gs-text-secondary hover:bg-gs-datepicker-day-bg-hover hover:text-gs-text focus-visible:outline-none focus-visible:shadow-gs-input-focus disabled:cursor-not-allowed disabled:text-gs-text-disabled [&_svg]:block [&_svg]:size-4";

const nativeInputClasses =
  "gs-date-range-picker-native pointer-events-none absolute -m-gs-control-border-width size-gs-control-border-width overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)] [clip-path:inset(50%)]";

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M3.5 9.5H20.5M8 3.5V6.5M16 3.5V6.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 4L12 12M12 4L4 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const loadDateRangeCalendar = () => import("./DateRangeCalendar");
const DateRangeCalendar = lazy(loadDateRangeCalendar);

function parseRange(value?: DateRangeInput): DateRangeValue {
  return {
    start: toDateValue(value?.start),
    end: toDateValue(value?.end),
  };
}

function rangeKey(value?: DateRangeInput): string {
  return `${serializeDate(toDateValue(value?.start))}/${serializeDate(toDateValue(value?.end))}`;
}

function toCalendarDate(value: Date | string | null | undefined) {
  const date = toDateValue(value);
  return date
    ? new InternationalizedCalendarDate(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
      )
    : null;
}

function fromCalendarDate(value: CalendarDate): Date {
  return new Date(value.year, value.month - 1, value.day);
}

type DateRangePickerComposition = {
  label?: DateRangePickerLabelProps;
  description?: DateRangePickerDescriptionProps;
  errorMessage?: DateRangePickerErrorMessageProps;
};

const slotSchema = {
  "DateRangePicker.Label": "label",
  "DateRangePicker.Description": "description",
  "DateRangePicker.ErrorMessage": "errorMessage",
} as const satisfies Readonly<Record<string, keyof DateRangePickerComposition>>;

function collectComposition(children: ReactNode): DateRangePickerComposition {
  return collectCompoundSlotProps<DateRangePickerComposition>(
    children,
    slotSchema,
  );
}

function DateRangePickerImpl(
  {
    children,
    value,
    defaultValue,
    onValueChange,
    min,
    max,
    disabled = false,
    invalid = false,
    required = false,
    readOnly = false,
    startLabel = "Start date",
    endLabel = "End date",
    clearLabel = "Clear date range",
    openCalendarLabel = "Open calendar",
    previousMonthLabel = "Previous month",
    nextMonthLabel = "Next month",
    size = "md",
    fullWidth = false,
    clearable = false,
    locale,
    weekStartsOn = 0,
    dir = "ltr",
    open,
    defaultOpen,
    onOpenChange,
    startName,
    endName,
    form,
    id,
    className,
    ...props
  }: DateRangePickerProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const { label, description, errorMessage } = collectComposition(children);
  const generatedId = useId();
  const fieldId = id ?? `${generatedId}-date-range`;
  const descriptionId = `${fieldId}-description`;
  const errorId = `${fieldId}-error`;
  const initialValueRef = useRef(parseRange(defaultValue));
  const rootRef = useRef<HTMLDivElement | null>(null);
  const groupRef = useRef<HTMLDivElement | null>(null);
  const startNativeInputRef = useRef<HTMLInputElement | null>(null);
  const endNativeInputRef = useRef<HTMLInputElement | null>(null);
  const composedRef = useComposedRefs(ref, rootRef);
  const controlled = value !== undefined;
  const controlledKey = rangeKey(value);
  const controlledValue = useMemo(() => {
    const [start, end] = controlledKey.split("/");
    return { start: toDateValue(start), end: toDateValue(end) };
  }, [controlledKey]);
  const [selected, setSelected] = useControllableState<DateRangeValue>({
    value: controlled ? controlledValue : undefined,
    defaultValue: initialValueRef.current,
  });
  const [stateOpen, setStateOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const isOpen = disabled || readOnly ? false : stateOpen;
  const hasNativeControl = Boolean(startName || endName || required);
  const hasOrderError = Boolean(
    selected.start &&
    selected.end &&
    selected.start.getTime() > selected.end.getTime(),
  );
  const isInvalid = invalid || hasOrderError || Boolean(errorMessage?.children);
  const ariaValue = useMemo(() => {
    const start = toCalendarDate(selected.start);
    const end = toCalendarDate(selected.end);
    return start && end && start.compare(end) <= 0 ? { start, end } : null;
  }, [selected.end, selected.start]);
  const minValue = useMemo(() => toCalendarDate(min), [min]);
  const maxValue = useMemo(() => toCalendarDate(max), [max]);

  const commit = useCallback(
    (next: DateRangeValue) => {
      if (rangeKey(next) === rangeKey(selected)) return;
      const startChanged =
        serializeDate(next.start) !== serializeDate(selected.start);
      const endChanged =
        serializeDate(next.end) !== serializeDate(selected.end);
      const startInput = startNativeInputRef.current;
      const endInput = endNativeInputRef.current;
      setSelected(next);
      onValueChange?.(next);
      queueMicrotask(() => {
        if (startChanged && startInput?.isConnected) {
          startInput.dispatchEvent(new Event("change", { bubbles: true }));
        }
        if (endChanged && endInput?.isConnected) {
          endInput.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    },
    [onValueChange, selected, setSelected],
  );

  useEffect(() => {
    if (controlled) return;
    const associatedForm = rootRef.current?.querySelector("input")?.form;
    if (!associatedForm) return;
    const handleReset = () => setSelected(initialValueRef.current);
    associatedForm.addEventListener("reset", handleReset);
    return () => associatedForm.removeEventListener("reset", handleReset);
  }, [controlled, form, hasNativeControl, setSelected]);

  useEffect(() => {
    if ((disabled || readOnly) && stateOpen) {
      setStateOpen(false);
    }
  }, [disabled, readOnly, setStateOpen, stateOpen]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if ((disabled || readOnly) && next) return;
      setStateOpen(next);
    },
    [disabled, readOnly, setStateOpen],
  );

  const focusVisibleControl = useCallback(() => {
    groupRef.current
      ?.querySelector<HTMLElement>(
        '[role="spinbutton"]:not([aria-disabled="true"])',
      )
      ?.focus();
  }, []);

  const dateRangePicker = (
    <AriaDateRangePicker
      value={ariaValue}
      {...(label?.children == null
        ? { "aria-label": `${startLabel} ${endLabel}` }
        : {})}
      onChange={(next) =>
        commit(
          next
            ? {
                start: fromCalendarDate(next.start),
                end: fromCalendarDate(next.end),
              }
            : { start: null, end: null },
        )
      }
      {...(minValue ? { minValue } : {})}
      {...(maxValue ? { maxValue } : {})}
      isDisabled={disabled}
      isReadOnly={readOnly}
      isRequired={required}
      isInvalid={isInvalid}
      shouldCloseOnSelect
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      className="contents"
    >
      {label?.children != null ? (
        <Label
          {...label}
          className={clsx(
            inputLabelClasses,
            inputLabelSizeClasses[size],
            disabled && "cursor-not-allowed text-gs-text-disabled",
            label.className,
          )}
        >
          {label.children}
          {required ? (
            <span className={inputRequiredClasses} aria-hidden="true">
              *
            </span>
          ) : null}
        </Label>
      ) : null}

      <Group
        ref={groupRef}
        className={({ isFocusWithin }) =>
          clsx(
            "gs-date-range-picker-group inline-flex h-[max(var(--gs-drp-box),var(--control-hit-target))] min-h-[max(var(--gs-drp-box),var(--control-hit-target))] w-full min-w-0 max-w-full items-center gap-1 overflow-hidden rounded-gs-xs border border-gs-default bg-gs-surface bg-gs-surface-highlight text-gs-input-color shadow-gs-surface-sheen transition-[background-color,border-color,box-shadow] duration-200 ease-gs-standard hover:border-gs-strong motion-reduce:transition-none",
            fieldSizeClasses[size],
            fullWidth && "w-full",
            isFocusWithin &&
              "border-gs-focus bg-gs-surface-raised shadow-gs-input-surface-focus",
            isInvalid &&
              "border-gs-error bg-gs-error-subtle shadow-gs-input-invalid-focus",
            disabled && "cursor-not-allowed opacity-gs-disabled",
          )
        }
        {...([
          description?.children ? descriptionId : null,
          errorMessage?.children ? errorId : null,
        ]
          .filter(Boolean)
          .join(" ")
          ? {
              "aria-describedby": [
                description?.children ? descriptionId : null,
                errorMessage?.children ? errorId : null,
              ]
                .filter(Boolean)
                .join(" "),
            }
          : {})}
        {...(isInvalid ? { "aria-invalid": true } : {})}
      >
        <DateInput
          slot="start"
          aria-label={startLabel}
          className="gs-date-range-picker-input flex min-w-0 shrink-0 items-center tabular-nums"
        >
          {(segment) => (
            <DateSegment
              segment={segment}
              className={({ isFocused, isPlaceholder }) =>
                clsx(
                  "rounded-gs-xs outline-none transition-[color,background-color,box-shadow] duration-200 ease-gs-standard motion-reduce:transition-none",
                  segment.type === "literal" ? "px-0" : "px-px",
                  isPlaceholder && "text-gs-input-placeholder",
                  isFocused &&
                    "bg-gs-datepicker-day-bg-selected text-gs-datepicker-day-color-selected",
                )
              }
            />
          )}
        </DateInput>

        <span
          className="gs-date-range-picker-separator shrink-0 text-gs-text-secondary"
          aria-hidden="true"
          role="separator"
        >
          –
        </span>

        <DateInput
          slot="end"
          aria-label={endLabel}
          className="gs-date-range-picker-input flex min-w-0 shrink-0 items-center tabular-nums"
        >
          {(segment) => (
            <DateSegment
              segment={segment}
              className={({ isFocused, isPlaceholder }) =>
                clsx(
                  "rounded-gs-xs outline-none transition-[color,background-color,box-shadow] duration-200 ease-gs-standard motion-reduce:transition-none",
                  segment.type === "literal" ? "px-0" : "px-px",
                  isPlaceholder && "text-gs-input-placeholder",
                  isFocused &&
                    "bg-gs-datepicker-day-bg-selected text-gs-datepicker-day-color-selected",
                )
              }
            />
          )}
        </DateInput>

        <span className="gs-date-range-picker-actions -me-[var(--gs-drp-inline)] ms-auto inline-flex h-full shrink-0 items-center ps-1 before:me-1 before:h-5 before:w-px before:shrink-0 before:bg-gs-default">
          {clearable &&
          (selected.start || selected.end) &&
          !disabled &&
          !readOnly ? (
            <button
              type="button"
              className={iconButtonClasses}
              aria-label={clearLabel}
              onClick={() => commit({ start: null, end: null })}
            >
              <CloseIcon />
            </button>
          ) : null}

          <AriaButton
            className={iconButtonClasses}
            aria-label={openCalendarLabel}
            onFocus={() => void loadDateRangeCalendar()}
            onPointerEnter={() => void loadDateRangeCalendar()}
          >
            <CalendarIcon />
          </AriaButton>
        </span>
      </Group>

      {hasNativeControl && (
        <>
          <input
            ref={startNativeInputRef}
            className={nativeInputClasses}
            type="date"
            name={startName}
            form={form}
            value={serializeDate(selected.start)}
            min={serializeDate(toDateValue(min))}
            max={serializeDate(toDateValue(max))}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            tabIndex={-1}
            aria-hidden="true"
            onChange={() => {}}
            onInvalid={focusVisibleControl}
          />
          <input
            ref={endNativeInputRef}
            className={nativeInputClasses}
            type="date"
            name={endName}
            form={form}
            value={serializeDate(selected.end)}
            min={serializeDate(selected.start ?? toDateValue(min))}
            max={serializeDate(toDateValue(max))}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            tabIndex={-1}
            aria-hidden="true"
            onChange={() => {}}
            onInvalid={focusVisibleControl}
          />
        </>
      )}

      {description?.children != null ? (
        <div
          {...description}
          id={descriptionId}
          className={clsx(
            inputDescriptionClasses,
            disabled && "text-gs-text-disabled",
            description.className,
          )}
        >
          {description.children}
        </div>
      ) : null}
      {errorMessage?.children ? (
        <div
          {...errorMessage}
          id={errorId}
          className={clsx(inputErrorClasses, errorMessage.className)}
          role="alert"
        >
          {errorMessage.children}
        </div>
      ) : null}

      {isOpen ? (
        <Suspense fallback={null}>
          <DateRangeCalendar
            weekStartsOn={weekStartsOn}
            dir={dir}
            previousMonthLabel={previousMonthLabel}
            nextMonthLabel={nextMonthLabel}
          />
        </Suspense>
      ) : null}
    </AriaDateRangePicker>
  );

  return (
    <div
      {...props}
      ref={composedRef}
      id={fieldId}
      className={clsx(
        inputFieldClasses,
        "gs-date-range-picker",
        fullWidth ? "grid w-full" : "w-[min(18rem,100%)]",
        className,
      )}
      data-size={size}
      data-full-width={fullWidth ? "true" : undefined}
      data-invalid={isInvalid ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      data-readonly={readOnly ? "true" : undefined}
      data-required={required ? "true" : undefined}
      data-open={isOpen ? "true" : undefined}
      dir={dir}
    >
      {locale ? (
        <I18nProvider locale={locale}>{dateRangePicker}</I18nProvider>
      ) : (
        dateRangePicker
      )}
    </div>
  );
}

const DateRangePickerRoot = forwardRef(DateRangePickerImpl);
DateRangePickerRoot.displayName = "DateRangePicker";

const DateRangePickerLabel = createCompoundSlot<DateRangePickerLabelProps>(
  "DateRangePicker.Label",
);
const DateRangePickerDescription =
  createCompoundSlot<DateRangePickerDescriptionProps>(
    "DateRangePicker.Description",
  );
const DateRangePickerErrorMessage =
  createCompoundSlot<DateRangePickerErrorMessageProps>(
    "DateRangePicker.ErrorMessage",
  );

export const DateRangePicker = Object.assign(DateRangePickerRoot, {
  Label: DateRangePickerLabel,
  Description: DateRangePickerDescription,
  ErrorMessage: DateRangePickerErrorMessage,
});
