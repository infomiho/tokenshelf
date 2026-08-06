import Schema from "typebox/schema";
import {
  assessDesignSystemDocument,
  designSystemDocumentJsonSchema,
  type DesignSystemDocument,
} from "./index";
import { normalizeTags } from "./tags";

const documentValidator = Schema.Compile(designSystemDocumentJsonSchema);
type SchemaError = ReturnType<typeof documentValidator.Errors>[1][number];

export const designSystemDocumentDecoder = {
  "~standard": {
    version: 1 as const,
    vendor: "tokenshelf",
    validate(value: unknown) {
      const issues = schemaIssues(value);
      if (issues.length) return { issues };
      const normalizedValue = normalizeDocumentTags(value);
      const normalizedIssues = schemaIssues(normalizedValue);
      return normalizedIssues.length
        ? { issues: normalizedIssues }
        : { value: normalizedValue as DesignSystemDocument };
    },
  },
};

export type DesignSystemValidation =
  | {
      kind: "structural-failure";
      issues: ReadonlyArray<{ message: string; path?: ReadonlyArray<string | number> }>;
    }
  | {
      kind: "assessed";
      document: DesignSystemDocument;
      assessment: ReturnType<typeof assessDesignSystemDocument>;
    };

export async function validateDesignSystemDocument(
  value: unknown,
): Promise<DesignSystemValidation> {
  const decoded = await designSystemDocumentDecoder["~standard"].validate(value);
  if (decoded.issues) return { kind: "structural-failure", issues: decoded.issues };
  return {
    kind: "assessed",
    document: decoded.value,
    assessment: assessDesignSystemDocument(decoded.value),
  };
}

function schemaIssues(value: unknown) {
  const [, errors] = documentValidator.Errors(value);
  return errors.flatMap((error) => {
    const path = schemaIssuePath(error.instancePath);
    const properties =
      error.keyword === "required"
        ? error.params.requiredProperties
        : error.keyword === "additionalProperties"
          ? error.params.additionalProperties
          : [];
    if (properties.length)
      return properties.map((property) => ({ message: error.message, path: [...path, property] }));
    return [{ message: error.message, ...(path.length ? { path } : {}) }];
  });
}

function schemaIssuePath(pointer: SchemaError["instancePath"]): Array<string | number> {
  return pointer
    .split("/")
    .slice(1)
    .map((segment) => segment.replaceAll("~1", "/").replaceAll("~0", "~"))
    .map((segment) => (/^(0|[1-9]\d*)$/.test(segment) ? Number(segment) : segment));
}

function normalizeDocumentTags(value: unknown) {
  if (!isRecord(value) || !isRecord(value.identity) || !Array.isArray(value.identity.tags))
    return value;
  if (!value.identity.tags.every((tag): tag is string => typeof tag === "string")) return value;
  return {
    ...value,
    identity: {
      ...value.identity,
      tags: normalizeTags(value.identity.tags),
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
