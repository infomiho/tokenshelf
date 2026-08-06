import type { WorkModel } from "@infomiho/agent-work-protocol";
import {
  assessDesignSystemDocument,
  createMinimalDesignSystemDocument,
  designSystemDiagnosticDefinitions,
  designSystemDocumentJsonSchema,
  type DesignArtifacts,
  type DesignSystemDocument,
} from "./index";
import { designSystemDocumentDecoder } from "./validation";

export const designSystemModel: WorkModel<DesignSystemDocument, DesignArtifacts> = {
  id: "design-system",
  version: "1",
  schema: { decoder: designSystemDocumentDecoder, jsonSchema: designSystemDocumentJsonSchema },
  assess: assessDesignSystemDocument,
  authoring: {
    title: "Tokenshelf DesignSystemDocument",
    description:
      "Structured, canonical design-system work. DESIGN.md and preview data are generated artifacts.",
    examples: [createMinimalDesignSystemDocument()],
    diagnostics: designSystemDiagnosticDefinitions,
  },
};
