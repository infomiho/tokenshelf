import { describe, expect, it } from "vitest";
import { buildDesignPrompt } from "./design-prompt";

describe("buildDesignPrompt", () => {
  it("includes the public DESIGN.md URL and implementation guidance", () => {
    expect(buildDesignPrompt("https://api.tokenshelf.dev/v1/systems/example/DESIGN.md"))
      .toBe(`Implement my interface using this DESIGN.md as the source of truth:
https://api.tokenshelf.dev/v1/systems/example/DESIGN.md

Preserve its tokens, component states, and accessibility guidance. Adapt layout and content to the product.`);
  });
});
