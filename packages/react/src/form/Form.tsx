import type {
  ChangeEvent,
  FormEvent,
  ForwardedRef,
  ReactElement,
  ReactNode,
} from "react";
import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { clsx } from "clsx";
import { getValueByName, setValueByName, type FormValues } from "./form-utils";
import type {
  FieldMeta,
  FormContextValue,
  FormErrors,
  FormItemProps,
  FormProps,
  FormRule,
} from "./Form.types";
import { runRules, validateFields } from "./validate";

const FormContext = createContext<FormContextValue | null>(null);
const EMPTY_RULES: FormRule[] = [];

function useFormContext(component: string): FormContextValue {
  const ctx = useContext(FormContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Form>`);
  }
  return ctx;
}

function FormImpl(
  {
    initialValues = {},
    values: valuesProp,
    onValuesChange,
    onSubmit,
    onSubmitFailed,
    validateOnChange = true,
    className,
    children,
    ...props
  }: FormProps,
  ref: ForwardedRef<HTMLFormElement>,
) {
  const isControlled = valuesProp !== undefined;
  const [innerValues, setInnerValues] = useState<FormValues>(initialValues);
  const values = isControlled ? (valuesProp as FormValues) : innerValues;
  const [errors, setErrors] = useState<FormErrors>({});
  const [metas, setMetas] = useState<Record<string, FieldMeta | undefined>>({});
  const rulesRef = useRef(new Map<string, FormRule[]>());
  const validationRunsRef = useRef(new Map<string, number>());
  const submitRunRef = useRef(0);
  const mountedRef = useRef(true);
  const formId = useId();

  useEffect(() => {
    const validationRuns = validationRunsRef.current;
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      submitRunRef.current += 1;
      validationRuns.clear();
    };
  }, []);

  const setValues = useCallback(
    (next: FormValues, changed: FormValues) => {
      if (!isControlled) {
        setInnerValues(next);
      }
      onValuesChange?.(changed, next);
    },
    [isControlled, onValuesChange],
  );

  const registerField = useCallback((name: string, rules: FormRule[]) => {
    rulesRef.current.set(name, rules);
  }, []);

  const unregisterField = useCallback((name: string) => {
    rulesRef.current.delete(name);
    validationRunsRef.current.delete(name);
    if (!mountedRef.current) {
      return;
    }
    setErrors((prev) => {
      if (!(name in prev)) {
        return prev;
      }
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const setFieldValue = useCallback(
    (name: string, value: unknown) => {
      const next = setValueByName(values, name, value);
      setValues(next, { [name]: value });
      return next;
    },
    [setValues, values],
  );

  const setFieldTouched = useCallback((name: string, touched = true) => {
    setMetas((prev) => ({
      ...prev,
      [name]: {
        error: prev[name]?.error,
        validating: prev[name]?.validating ?? false,
        touched,
      },
    }));
  }, []);

  const validateField = useCallback(
    async (name: string, nextValues?: FormValues) => {
      // `nextValues` lets change handlers validate the value they just
      // committed instead of the not-yet-rendered state snapshot.
      const current = nextValues ?? values;
      const run = (validationRunsRef.current.get(name) ?? 0) + 1;
      validationRunsRef.current.set(name, run);
      setMetas((prev) => ({
        ...prev,
        [name]: {
          error: prev[name]?.error,
          touched: prev[name]?.touched ?? false,
          validating: true,
        },
      }));
      const error = await runRules(
        getValueByName(current, name),
        current,
        rulesRef.current.get(name) ?? [],
      );
      if (!mountedRef.current || validationRunsRef.current.get(name) !== run) {
        return error;
      }
      setErrors((prev) => ({ ...prev, [name]: error }));
      setMetas((prev) => ({
        ...prev,
        [name]: {
          error,
          touched: prev[name]?.touched ?? true,
          validating: false,
        },
      }));
      return error;
    },
    [values],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitRunRef.current += 1;
    const submitRun = submitRunRef.current;
    rulesRef.current.forEach((_, name) => {
      validationRunsRef.current.set(
        name,
        (validationRunsRef.current.get(name) ?? 0) + 1,
      );
    });
    const nextErrors = await validateFields(values, rulesRef.current);
    if (!mountedRef.current || submitRunRef.current !== submitRun) {
      return;
    }
    setErrors(nextErrors);
    setMetas((prev) => {
      const next = { ...prev };
      Object.keys(nextErrors).forEach((name) => {
        next[name] = {
          error: nextErrors[name],
          touched: true,
          validating: false,
        };
      });
      return next;
    });

    const failed = Object.values(nextErrors).some(Boolean);
    if (failed) {
      onSubmitFailed?.(nextErrors, values);
      const first = Object.entries(nextErrors).find(([, error]) =>
        Boolean(error),
      );
      if (first) {
        const field = document.getElementById(`${formId}-${first[0]}`);
        field?.focus?.();
      }
      return;
    }

    await onSubmit?.(values);
  };

  const ctx = useMemo<FormContextValue>(
    () => ({
      values,
      errors,
      metas,
      setFieldValue,
      setFieldTouched,
      validateField,
      registerField,
      unregisterField,
      getFieldValue: (name) => getValueByName(values, name),
      validateOnChange,
      formId,
    }),
    [
      errors,
      formId,
      metas,
      registerField,
      setFieldTouched,
      setFieldValue,
      unregisterField,
      validateField,
      validateOnChange,
      values,
    ],
  );

  return (
    <FormContext.Provider value={ctx}>
      <form
        ref={ref}
        className={clsx(
          "gs-form flex min-w-0 flex-col gap-gs-form-gap font-inherit text-gs-text",
          className,
        )}
        noValidate
        onSubmit={handleSubmit}
        {...props}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
}

const FormRoot = forwardRef(FormImpl);
FormRoot.displayName = "Form";

function FormItemImpl(
  {
    name,
    rules = EMPTY_RULES,
    required,
    noStyle = false,
    className,
    children,
    ...props
  }: FormItemProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const {
    values,
    errors,
    metas,
    setFieldValue,
    setFieldTouched,
    validateField,
    registerField,
    unregisterField,
    validateOnChange,
    formId,
  } = useFormContext("Form.Item");

  const mergedRules = useMemo(() => {
    if (required && !rules.some((rule) => rule.required)) {
      return [{ required: true }, ...rules];
    }
    return rules;
  }, [required, rules]);

  // Registration must survive re-renders: inline `rules` arrays change
  // identity every render, so unregistering in the same effect would wipe
  // the field's error state right after it is set.
  useEffect(() => {
    registerField(name, mergedRules);
  }, [mergedRules, name, registerField]);

  useEffect(() => {
    return () => unregisterField(name);
  }, [name, unregisterField]);

  const value = getValueByName(values, name);
  const error = errors[name];
  const meta = metas[name];
  const fieldId = `${formId}-${name}`;
  const errorId = `${fieldId}-error`;
  const isRequired =
    required || mergedRules.some((rule) => Boolean(rule.required));

  const control = (() => {
    const child = Children.only(children);
    if (!isValidElement(child)) {
      return children;
    }

    const childProps = child.props as {
      value?: unknown;
      defaultValue?: unknown;
      onChange?: (event: unknown) => void;
      onBlur?: (event: unknown) => void;
      id?: string;
      name?: string;
      invalid?: boolean;
      errorMessage?: ReactNode;
      "aria-invalid"?: boolean;
      "aria-describedby"?: string;
      checked?: boolean;
    };

    const describedBy = [childProps["aria-describedby"], error ? errorId : null]
      .filter(Boolean)
      .join(" ");

    const handleChange = (event: unknown) => {
      childProps.onChange?.(event);
      let nextValue: unknown = event;
      if (event != null && typeof event === "object" && "target" in event) {
        const target = (event as ChangeEvent<HTMLInputElement>).target;
        if (target.type === "checkbox") {
          nextValue = target.checked;
        } else {
          nextValue = target.value;
        }
      }
      const nextValues = setFieldValue(name, nextValue);
      if (validateOnChange && meta?.touched) {
        void validateField(name, nextValues);
      }
    };

    const handleBlur = (event: unknown) => {
      childProps.onBlur?.(event);
      setFieldTouched(name, true);
      void validateField(name);
    };

    const injected: Record<string, unknown> = {
      id: childProps.id ?? fieldId,
      name: childProps.name ?? name,
      onChange: handleChange,
      onBlur: handleBlur,
      invalid: Boolean(error) || childProps.invalid,
      "aria-invalid": Boolean(error) || undefined,
      "aria-describedby": describedBy || undefined,
      required: isRequired || undefined,
    };

    // Boolean values bind to checked (Switch / checkbox); otherwise value.
    if (typeof value === "boolean" || childProps.checked !== undefined) {
      injected.checked = Boolean(value);
    } else {
      injected.value = value ?? "";
    }

    return cloneElement(child as ReactElement, injected);
  })();

  if (noStyle) {
    return <>{control}</>;
  }

  return (
    <div
      ref={ref}
      {...props}
      className={clsx(
        "gs-form-item grid min-w-0 gap-gs-form-item-gap",
        className,
      )}
      data-invalid={error ? "true" : undefined}
      data-required={isRequired ? "true" : undefined}
    >
      <div className="gs-form-control min-w-0">{control}</div>
      {error ? (
        <div
          id={errorId}
          className="gs-form-error text-gs-form-helper-size leading-gs-normal text-gs-error"
          role="alert"
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}

const FormItem = forwardRef(FormItemImpl);
FormItem.displayName = "Form.Item";

export const Form = Object.assign(FormRoot, {
  Item: FormItem,
});
