import { describe, expect, it } from "vitest";
import { catalogFixtures } from "../../app/src/data/catalogFixtures.ts";
import { validateDocumentJson } from "./validation.js";

describe("document validation", () => {
  it("validates inspiration metadata through the bundled domain schema", async () => {
    const document = structuredClone(catalogFixtures[0]!.document);

    expect(await validateDocumentJson(JSON.stringify(document))).toMatchObject({ outcome: "pass" });

    document.provenance.inspiration!.sourceUrl = "javascript:alert(1)";
    expect(await validateDocumentJson(JSON.stringify(document))).toMatchObject({
      outcome: "fail",
      diagnostics: expect.arrayContaining([
        expect.objectContaining({ pointer: "/provenance/inspiration/sourceUrl" }),
      ]),
    });
  });
});
