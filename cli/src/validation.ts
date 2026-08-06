import { validateDesignSystemDocument } from "../../app/src/domain/design-system/validation.ts";

type ValidationDiagnostic = {
  severity: "error" | "warning";
  code: string;
  message: string;
  pointer?: string;
  help?: string;
};

export type ValidationResult = {
  outcome: "pass" | "fail";
  diagnostics: ValidationDiagnostic[];
};

const pointerSegment = (value: string | number) =>
  String(value).replaceAll("~", "~0").replaceAll("/", "~1");

export async function validateDocumentJson(input: string): Promise<ValidationResult> {
  let value: unknown;
  try {
    value = JSON.parse(input);
  } catch {
    return {
      outcome: "fail",
      diagnostics: [
        { severity: "error", code: "schema.invalid", message: "Input is not valid JSON." },
      ],
    };
  }

  const validation = await validateDesignSystemDocument(value);
  if (validation.kind === "structural-failure") {
    return {
      outcome: "fail",
      diagnostics: validation.issues.map((issue) => ({
        severity: "error",
        code: "schema.invalid",
        message: issue.message,
        ...(issue.path?.length
          ? { pointer: `/${issue.path.map((segment) => pointerSegment(segment)).join("/")}` }
          : {}),
      })),
    };
  }

  const { diagnostics } = validation.assessment;
  return {
    outcome: diagnostics.some(({ severity }) => severity === "error") ? "fail" : "pass",
    diagnostics,
  };
}
