import { clsx } from "clsx";
import type { InputSize } from "../input";
import type { TextAreaResize } from "./TextArea.types";
import {
  controlShellBaseClasses,
  controlShellInvalidClasses,
  controlShellInvalidHoverClasses,
} from "../shared/control-shell-classes";

export const textAreaResizeClasses: Record<TextAreaResize, string> = {
  none: "resize-none",
  vertical: "resize-y",
  horizontal: "resize-x",
  both: "resize",
};

export const textAreaShellSizeClasses: Record<InputSize, string> = {
  sm: "[--gs-textarea-pad-y:var(--space-1\\.5)] [--gs-textarea-pad-x:var(--space-2)] [--gs-textarea-font:var(--font-size-xs)]",
  md: "[--gs-textarea-pad-y:var(--space-2)] [--gs-textarea-pad-x:var(--space-3)] [--gs-textarea-font:var(--font-size-sm)]",
  lg: "[--gs-textarea-pad-y:var(--space-2\\.5)] [--gs-textarea-pad-x:var(--space-4)] [--gs-textarea-font:var(--font-size-md)]",
};

export type TextAreaShellClassesOptions = {
  /** Default: `"md"`. */
  size?: InputSize;
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  fullWidth?: boolean;
};

/** Style recipe for the TextArea shell (bordered box around the textarea). */
export function textAreaShellClasses({
  size = "md",
  invalid = false,
  disabled = false,
  readOnly = false,
  fullWidth = false,
}: TextAreaShellClassesOptions = {}): string {
  return clsx(
    "gs-textarea-shell inline-grid max-w-full gap-gs-2",
    controlShellBaseClasses,
    "px-gs-textarea-pad-x py-gs-textarea-pad-y text-gs-textarea-font font-gs-regular leading-gs-normal text-gs-text has-[.gs-textarea:focus-visible]:shadow-gs-input-surface-focus",
    textAreaShellSizeClasses[size],
    fullWidth && "grid w-full",
    invalid
      ? clsx(
          controlShellInvalidClasses,
          "has-[.gs-textarea:focus-visible]:shadow-gs-input-invalid-focus",
        )
      : !disabled &&
          !readOnly &&
          "hover:not-focus-within:border-gs-border-focus hover:not-focus-within:bg-gs-action-hover",
    invalid && !disabled && controlShellInvalidHoverClasses,
    disabled
      ? "cursor-not-allowed opacity-gs-disabled"
      : readOnly && "cursor-default",
  );
}

export type TextAreaControlClassesOptions = {
  /** Default: `"vertical"`. */
  resize?: TextAreaResize;
  autosize?: boolean;
};

/** Style recipe for the native `<textarea>` element. */
export function textAreaControlClasses({
  resize = "vertical",
  autosize = false,
}: TextAreaControlClassesOptions = {}): string {
  return clsx(
    "gs-textarea m-gs-0 block min-h-[calc(1em*var(--line-height-normal)*var(--gs-textarea-min-rows))] w-full min-w-gs-20 appearance-none box-border border-0 bg-transparent p-gs-0 font-inherit leading-inherit text-inherit caret-gs-border-focus outline-none placeholder:text-gs-text-secondary placeholder:opacity-100 selection:bg-gs-input-selection selection:text-gs-text disabled:cursor-not-allowed disabled:resize-none disabled:[-webkit-text-fill-color:currentcolor] read-only:cursor-default",
    textAreaResizeClasses[resize],
    autosize &&
      "max-h-[calc(1em*var(--line-height-normal)*var(--gs-textarea-max-rows))] resize-none overflow-y-auto field-sizing-content",
  );
}

/** Classes for the counter footer row. */
export const textAreaFooterClasses =
  "gs-textarea-footer flex min-h-gs-3 items-center justify-end gap-gs-2";

/** Classes for the character counter. */
export const textAreaCountClasses =
  "gs-textarea-count select-none text-gs-xs leading-gs-none text-gs-text-secondary tabular-nums data-[over=true]:text-gs-error";

/** Extra classes for the field wrapper when `fullWidth` is set. */
export const textAreaFieldFullWidthClasses = "grid w-full";

/** Extra classes for the label/description of a disabled textarea. */
export const textAreaDisabledTextClasses =
  "cursor-not-allowed text-gs-text-disabled";
