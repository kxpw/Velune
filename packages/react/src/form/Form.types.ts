import type {
  FormEvent,
  FormHTMLAttributes,
  HTMLAttributes,
  ReactElement,
  ReactNode,
} from "react";
import type { FormValues } from "./form-utils";

export type RuleObject = {
  required?: boolean | string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
  validator?: (
    value: unknown,
    values: FormValues,
  ) => void | string | Promise<void | string>;
};

export type FormRule = RuleObject;

export type FieldMeta = {
  error?: string | undefined;
  touched: boolean;
  validating: boolean;
};

export type FormErrors = Record<string, string | undefined>;

export interface FormProps extends Omit<
  FormHTMLAttributes<HTMLFormElement>,
  "onSubmit" | "onChange"
> {
  initialValues?: FormValues;
  values?: FormValues;
  onValuesChange?: (changed: FormValues, all: FormValues) => void;
  onSubmit?: (values: FormValues) => void | Promise<void>;
  onSubmitFailed?: (errors: FormErrors, values: FormValues) => void;
  /** Validate on change after first blur. Default: `true`. */
  validateOnChange?: boolean;
  children?: ReactNode;
}

export interface FormItemProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  name: string;
  rules?: FormRule[];
  required?: boolean;
  /** Disable form binding and only render layout. */
  noStyle?: boolean;
  children: ReactElement;
}

export type FormContextValue = {
  values: FormValues;
  errors: FormErrors;
  metas: Record<string, FieldMeta | undefined>;
  /** Commits the change and returns the resulting values snapshot. */
  setFieldValue: (name: string, value: unknown) => FormValues;
  setFieldTouched: (name: string, touched?: boolean) => void;
  /** Pass `nextValues` to validate a just-committed change. */
  validateField: (
    name: string,
    nextValues?: FormValues,
  ) => Promise<string | undefined>;
  registerField: (name: string, rules: FormRule[]) => void;
  unregisterField: (name: string) => void;
  getFieldValue: (name: string) => unknown;
  validateOnChange: boolean;
  formId: string;
};

export type FormSubmitEvent = FormEvent<HTMLFormElement>;
