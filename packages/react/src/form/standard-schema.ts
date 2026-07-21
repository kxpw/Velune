import type { FormErrors } from "./Form.types";

/**
 * The Standard Schema interface (https://standardschema.dev), implemented by
 * zod 3.24+, valibot, arktype, and others. The spec recommends vendoring
 * these types so no runtime or type dependency is required.
 */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  readonly "~standard": StandardSchemaV1Props<Input, Output>;
}

export interface StandardSchemaV1Props<Input = unknown, Output = Input> {
  readonly version: 1;
  readonly vendor: string;
  readonly validate: (
    value: unknown,
  ) => StandardSchemaV1Result<Output> | Promise<StandardSchemaV1Result<Output>>;
  readonly types?: StandardSchemaV1Types<Input, Output> | undefined;
}

export type StandardSchemaV1Result<Output> =
  | StandardSchemaV1SuccessResult<Output>
  | StandardSchemaV1FailureResult;

export interface StandardSchemaV1SuccessResult<Output> {
  readonly value: Output;
  readonly issues?: undefined;
}

export interface StandardSchemaV1FailureResult {
  readonly issues: ReadonlyArray<StandardSchemaV1Issue>;
}

export interface StandardSchemaV1Issue {
  readonly message: string;
  readonly path?:
    | ReadonlyArray<PropertyKey | StandardSchemaV1PathSegment>
    | undefined;
}

export interface StandardSchemaV1PathSegment {
  readonly key: PropertyKey;
}

export interface StandardSchemaV1Types<Input = unknown, Output = Input> {
  readonly input: Input;
  readonly output: Output;
}

/** Schema accepted by `<Form schema>`. */
export type FormSchema = StandardSchemaV1;

export function issuePathToName(path: StandardSchemaV1Issue["path"]): string {
  if (!path || path.length === 0) {
    return "";
  }
  return path
    .map((segment) =>
      typeof segment === "object" && segment != null && "key" in segment
        ? String(segment.key)
        : String(segment),
    )
    .join(".");
}

export type SchemaValidationResult =
  | { success: true; value: unknown }
  | { success: false; errors: FormErrors };

/**
 * Runs a Standard Schema against the form values and maps its issues to the
 * dot-path field names used by `Form.Item`. Issues without a path are
 * reported under the empty-string key.
 */
export async function runStandardSchema(
  schema: StandardSchemaV1,
  values: unknown,
): Promise<SchemaValidationResult> {
  const result = await schema["~standard"].validate(values);
  if (result.issues == null) {
    return { success: true, value: result.value };
  }
  const errors: FormErrors = {};
  for (const issue of result.issues) {
    const name = issuePathToName(issue.path);
    // The first issue per field wins, matching rule evaluation order.
    if (errors[name] === undefined) {
      errors[name] = issue.message;
    }
  }
  return { success: false, errors };
}
