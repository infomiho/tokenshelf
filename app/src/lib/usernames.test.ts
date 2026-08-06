import { describe, expect, it } from "vitest";
import { normalizePublicUsername } from "./usernames";

describe("public usernames", () => {
  it("normalizes GitHub handles and optional route prefixes", () => {
    expect(normalizePublicUsername(" @Token-Shelf ")).toBe("token-shelf");
  });

  it.each(["", "@", "-tokenshelf", "tokenshelf-", "token--shelf", "token_shelf"])(
    "rejects an invalid handle: %s",
    (value) => {
      expect(normalizePublicUsername(value)).toBeNull();
    },
  );

  it("rejects handles longer than GitHub's limit", () => {
    expect(normalizePublicUsername("a".repeat(40))).toBeNull();
  });
});
