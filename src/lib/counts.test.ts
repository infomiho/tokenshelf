import { describe, expect, it } from "vitest";
import { formatCount } from "./counts";

describe("formatCount", () => {
  it("uses singular and plural labels", () => {
    expect(formatCount(0, "vote")).toBe("0 votes");
    expect(formatCount(1, "vote")).toBe("1 vote");
    expect(formatCount(2, "copy", "copies")).toBe("2 copies");
  });
});
