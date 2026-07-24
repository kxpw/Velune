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
import {
  clampDate,
  dateInputKey,
  toDateValue,
} from "../date-picker/date-utils";
import {
  collectCompoundSlotProps,
  createCompoundSlot,
} from "../shared/compound-slot";
import { useComposedRefs } from "../shared/compose-refs";
import {
  inputFieldClasses,
  inputLabelSizeClasses,
} from "../shared/input-tailwind-classes";
import { useDismissibleFloating } from "../shared/use-dismissible-floating";
import { FieldChrome, getFieldDescribedBy } from "../shared/field-chrome";
import { useLatestRef } from "../shared/use-latest-ref";
import { DateRangeField } from "./DateRangeField";
import {
  dateRangePickerActionsClasses,
  dateRangePickerClasses,
  dateRangePickerClearInvisibleClasses,
  dateRangePickerDisabledLabelClasses,
  dateRangePickerDisabledTextClasses,
  dateRangePickerGroupClasses,
  dateRangePickerIconButtonClasses,
  dateRangePickerMessageWidthClasses,
  dateRangePickerNativeClasses,
  dateRangePickerSeparatorClasses,
} from "./DateRangePicker.classes";
import type {
  DateRangeInput,
  DateRangePickerDescriptionProps,
  DateRangePickerErrorMessageProps,
  DateRangePickerLabelProps,
  DateRangePickerProps,
  DateRangeValue,
} from "./DateRangePicker.types";
import { CalendarIcon, CloseIcon } from "../shared/icons";

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
  const {
    controlId: fieldId,
    labelId,
    descriptionId,
    errorId,
    describedBy,
  } = getFieldDescribedBy({
    id,
    reactId: generatedId,
    idSuffix: "date-range",
    hasDescription: Boolean(description?.children),
    hasError: Boolean(errorMessage?.children),
  });
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
  const minKey = dateInputKey(min);
  const maxKey = dateInputKey(max);
  const minDate = useMemo(
    () => toDateValue(typeof minKey === "number" ? new Date(minKey) : minKey),
    [minKey],
  );
  const maxDate = useMemo(
    () => toDateValue(typeof maxKey === "number" ? new Date(maxKey) : maxKey),
    [maxKey],
  );

  const constrainDate = useCallback(
    (date: Date | null) =>
      date == null ? null : clampDate(date, minDate, maxDate),
    [maxDate, minDate],
  );

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

  const setOpenStateRef = useLatestRef(setOpenState);

  useDismissibleFloating({
    open: isOpen,
    closeOnEscape: true,
    getContainNodes: () => [rootRef.current, document.getElementById(panelId)],
    onDismiss: (reason) => {
      if (reason === "outside") {
        setOpenStateRef.current(false);
      } else {
        closeAndRestoreFocus();
      }
    },
  });

  const focusVisibleControl = useCallback(() => {
    groupRef.current
      ?.querySelector<HTMLElement>(
        '[role="spinbutton"]:not([aria-disabled="true"])',
      )
      ?.focus();
  }, []);

  return (
    <FieldChrome
      {...props}
      ref={composedRef}
      id={fieldId}
      fieldClassName={clsx(
        inputFieldClasses,
        dateRangePickerClasses({ fullWidth }),
      )}
      className={className}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      invalid={isInvalid}
      dir={dir}
      data-readonly={readOnly ? "true" : undefined}
      data-required={required ? "true" : undefined}
      data-open={isOpen ? "true" : undefined}
      messageOrder="description-first"
      descriptionAs="div"
      errorAs="div"
      label={
        label
          ? {
              ...label,
              id: labelId,
              required,
              sizeClassName: inputLabelSizeClasses[size],
              disabledClassName: dateRangePickerDisabledLabelClasses,
              onClick: (event) => {
                label.onClick?.(event);
                if (!disabled) focusVisibleControl();
              },
            }
          : undefined
      }
      description={
        description
          ? {
              ...description,
              id: descriptionId,
              className: clsx(
                dateRangePickerMessageWidthClasses,
                description.className,
              ),
              disabledClassName: dateRangePickerDisabledTextClasses,
            }
          : undefined
      }
      errorMessage={
        errorMessage
          ? {
              ...errorMessage,
              id: errorId,
              className: clsx(
                dateRangePickerMessageWidthClasses,
                errorMessage.className,
              ),
            }
          : undefined
      }
      afterMessages={
        isOpen ? (
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
        ) : null
      }
    >
      <div
        ref={groupRef}
        role="group"
        {...(label?.children != null
          ? { "aria-labelledby": labelId }
          : { "aria-label": `${startLabel} ${endLabel}` })}
        className={dateRangePickerGroupClasses({
          size,
          fullWidth,
          invalid: isInvalid,
          disabled,
        })}
        {...(describedBy ? { "aria-describedby": describedBy } : {})}
        {...(isInvalid ? { "aria-invalid": true } : {})}
      >
        <DateRangeField
          value={selected.start}
          onCommit={(date) =>
            commit({ start: constrainDate(date), end: selected.end })
          }
          fieldLabel={startLabel}
          locale={resolvedLocale}
          disabled={disabled}
          readOnly={readOnly}
        />

        <span
          className={dateRangePickerSeparatorClasses}
          aria-hidden="true"
          role="separator"
        >
          –
        </span>

        <DateRangeField
          value={selected.end}
          onCommit={(date) =>
            commit({ start: selected.start, end: constrainDate(date) })
          }
          fieldLabel={endLabel}
          locale={resolvedLocale}
          disabled={disabled}
          readOnly={readOnly}
        />

        <span className={dateRangePickerActionsClasses}>
          {clearable && !disabled && !readOnly ? (
            <button
              type="button"
              className={clsx(
                dateRangePickerIconButtonClasses,
                // Keep the slot reserved while empty so the calendar button
                // does not shift when a value appears.
                !(selected.start || selected.end) &&
                  dateRangePickerClearInvisibleClasses,
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
            className={dateRangePickerIconButtonClasses}
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
            className={dateRangePickerNativeClasses}
            type="date"
            name={startName}
            form={form}
            value={serializeDate(selected.start)}
            min={serializeDate(minDate)}
            max={serializeDate(maxDate)}
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
            className={dateRangePickerNativeClasses}
            type="date"
            name={endName}
            form={form}
            value={serializeDate(selected.end)}
            min={serializeDate(selected.start ?? minDate)}
            max={serializeDate(maxDate)}
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
    </FieldChrome>
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
