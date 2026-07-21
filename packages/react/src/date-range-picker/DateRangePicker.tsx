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
import {
  isTopEscapeLayer,
  popEscapeLayer,
  pushEscapeLayer,
} from "../shared/overlay-stack";
import { DateRangeField } from "./DateRangeField";
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
  const labelId = `${fieldId}-label`;
  const descriptionId = `${fieldId}-description`;
  const errorId = `${fieldId}-error`;
  const panelId = `${fieldId}-panel`;
  const resolvedLocale =
    locale ?? (typeof navigator !== "undefined" ? navigator.language : "en");
  const initialValueRef = useRef(parseRange(defaultValue));
  const rootRef = useRef<HTMLDivElement | null>(null);
  const groupRef = useRef<HTMLDivElement | null>(null);
  const calendarButtonRef = useRef<HTMLButtonElement | null>(null);
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
  const minDate = useMemo(() => toDateValue(min), [min]);
  const maxDate = useMemo(() => toDateValue(max), [max]);

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

  const setOpenState = useCallback(
    (next: boolean) => {
      if ((disabled || readOnly) && next) return;
      setStateOpen(next);
    },
    [disabled, readOnly, setStateOpen],
  );

  const closeAndRestoreFocus = useCallback(() => {
    setOpenState(false);
    requestAnimationFrame(() => calendarButtonRef.current?.focus());
  }, [setOpenState]);

  useEffect(() => {
    if (!isOpen) return;
    const escapeLayer = pushEscapeLayer();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isTopEscapeLayer(escapeLayer)) {
        event.preventDefault();
        event.stopPropagation();
        closeAndRestoreFocus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      popEscapeLayer(escapeLayer);
    };
  }, [closeAndRestoreFocus, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      const panel = document.getElementById(panelId);
      if (rootRef.current?.contains(target) || panel?.contains(target)) {
        return;
      }
      setOpenState(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [isOpen, panelId, setOpenState]);

  const focusVisibleControl = useCallback(() => {
    groupRef.current
      ?.querySelector<HTMLElement>(
        '[role="spinbutton"]:not([aria-disabled="true"])',
      )
      ?.focus();
  }, []);

  const describedBy = [
    description?.children ? descriptionId : null,
    errorMessage?.children ? errorId : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      {...props}
      ref={composedRef}
      id={fieldId}
      className={clsx(
        inputFieldClasses,
        "gs-date-range-picker",
        // Grow with locale-dependent segment widths instead of clipping the
        // trailing action buttons against a hard field width.
        fullWidth ? "grid w-full" : "w-fit min-w-[min(18rem,100%)] max-w-full",
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
      {label?.children != null ? (
        <label
          {...label}
          id={labelId}
          className={clsx(
            inputLabelClasses,
            inputLabelSizeClasses[size],
            disabled && "cursor-not-allowed text-gs-text-disabled",
            label.className,
          )}
          onClick={(event) => {
            label.onClick?.(event);
            if (!disabled) focusVisibleControl();
          }}
        >
          {label.children}
          {required ? (
            <span className={inputRequiredClasses} aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      <div
        ref={groupRef}
        role="group"
        {...(label?.children != null
          ? { "aria-labelledby": labelId }
          : { "aria-label": `${startLabel} ${endLabel}` })}
        className={clsx(
          "gs-date-range-picker-group inline-flex h-[max(var(--gs-drp-box),var(--control-hit-target))] min-h-[max(var(--gs-drp-box),var(--control-hit-target))] w-full min-w-0 max-w-full items-center gap-1 overflow-hidden rounded-gs-xs border border-gs-default bg-gs-surface bg-gs-surface-highlight text-gs-input-color shadow-gs-surface-sheen transition-[background-color,border-color,box-shadow] duration-200 ease-gs-standard hover:border-gs-strong focus-within:border-gs-focus focus-within:bg-gs-surface-raised focus-within:shadow-gs-input-surface-focus motion-reduce:transition-none",
          fieldSizeClasses[size],
          fullWidth && "w-full",
          isInvalid &&
            "border-gs-error bg-gs-error-subtle shadow-gs-input-invalid-focus",
          disabled && "cursor-not-allowed opacity-gs-disabled",
        )}
        {...(describedBy ? { "aria-describedby": describedBy } : {})}
        {...(isInvalid ? { "aria-invalid": true } : {})}
      >
        <DateRangeField
          value={selected.start}
          onCommit={(date) => commit({ start: date, end: selected.end })}
          fieldLabel={startLabel}
          locale={resolvedLocale}
          disabled={disabled}
          readOnly={readOnly}
        />

        <span
          className="gs-date-range-picker-separator shrink-0 text-gs-text-secondary"
          aria-hidden="true"
          role="separator"
        >
          –
        </span>

        <DateRangeField
          value={selected.end}
          onCommit={(date) => commit({ start: selected.start, end: date })}
          fieldLabel={endLabel}
          locale={resolvedLocale}
          disabled={disabled}
          readOnly={readOnly}
        />

        <span className="gs-date-range-picker-actions -me-[var(--gs-drp-inline)] ms-auto inline-flex h-full shrink-0 items-center ps-1 before:me-1 before:h-5 before:w-px before:shrink-0 before:bg-gs-default">
          {clearable && !disabled && !readOnly ? (
            <button
              type="button"
              className={clsx(
                iconButtonClasses,
                // Keep the slot reserved while empty so the calendar button
                // does not shift when a value appears.
                !(selected.start || selected.end) && "invisible",
              )}
              aria-label={clearLabel}
              onClick={() => commit({ start: null, end: null })}
            >
              <CloseIcon />
            </button>
          ) : null}

          <button
            ref={calendarButtonRef}
            type="button"
            className={iconButtonClasses}
            aria-label={openCalendarLabel}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-controls={isOpen ? panelId : undefined}
            disabled={disabled}
            onFocus={() => void loadDateRangeCalendar()}
            onPointerEnter={() => void loadDateRangeCalendar()}
            onClick={() => setOpenState(!isOpen)}
          >
            <CalendarIcon />
          </button>
        </span>
      </div>

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
            // Wrap to the field width instead of widening the w-fit root.
            "w-0 min-w-full",
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
          className={clsx(
            inputErrorClasses,
            "w-0 min-w-full",
            errorMessage.className,
          )}
          role="alert"
        >
          {errorMessage.children}
        </div>
      ) : null}

      {isOpen ? (
        <Suspense fallback={null}>
          <DateRangeCalendar
            anchorRef={groupRef}
            panelId={panelId}
            value={selected}
            min={minDate}
            max={maxDate}
            locale={resolvedLocale}
            weekStartsOn={weekStartsOn}
            dir={dir}
            previousMonthLabel={previousMonthLabel}
            nextMonthLabel={nextMonthLabel}
            onSelect={(range, complete) => {
              commit(range);
              if (complete) closeAndRestoreFocus();
            }}
          />
        </Suspense>
      ) : null}
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
