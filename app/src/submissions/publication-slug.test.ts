import { describe, expect, it } from "vitest";
import { createPublicationSlug } from "./publication-slug";

describe("publication slug", () => {
  it("keeps duplicate display names readable and independently addressable", () => {
    expect(createPublicationSlug("Modern", "a1b2c3d4e5f6")).toBe("modern-a1b2c3d4e5f6");
    expect(createPublicationSlug("Modern", "f6e5d4c3b2a1")).toBe("modern-f6e5d4c3b2a1");
  });

  it("provides a readable fallback for names without ASCII letters or numbers", () => {
    expect(createPublicationSlug("現代", "a1b2c3d4e5f6")).toBe("design-system-a1b2c3d4e5f6");
  });
});
