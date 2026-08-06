import { describe, expect, it } from "vitest";
import { normalizeTagKey, normalizeTags } from "./tags";

describe("normalizeTagKey", () => {
  it("normalizes casing, Unicode, and whitespace without guessing synonyms", () => {
    expect(normalizeTagKey("  Developer   Tools ")).toBe("developer tools");
    expect(normalizeTagKey("ＭＩＮＩＭＡＬ")).toBe("minimal");
    expect(normalizeTagKey("dev tools")).not.toBe(normalizeTagKey("developer tools"));
  });

  it("stores normalized labels and removes case-insensitive duplicates", () => {
    expect(normalizeTags(["  Developer   Tools ", "developer tools", "ＭＩＮＩＭＡＬ"])).toEqual([
      "Developer Tools",
      "MINIMAL",
    ]);
  });
});
