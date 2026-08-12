import { describe, expect, it } from "vitest";
import { systemCardDataUrl } from "./contracts";

describe("systemCardDataUrl", () => {
  it("keeps the configured API origin", () => {
    expect(systemCardDataUrl("https://api.tokenshelf.dev", "a token")).toBe(
      "https://api.tokenshelf.dev/internal/system-card-capture/data?token=a%20token",
    );
  });
});
