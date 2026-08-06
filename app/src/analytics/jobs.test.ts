import { describe, expect, it } from "vitest";
import { guestSubmissionLastActivity } from "./guest-cleanup";

describe("guest cleanup activity", () => {
  it("uses the newest submission, draft, session, or guest activity", () => {
    const candidate = {
      updatedAt: new Date("2026-08-01T00:00:00Z"),
      draft: { updatedAt: new Date("2026-08-02T00:00:00Z") },
      guestSession: { lastUsedAt: new Date("2026-08-03T00:00:00Z") },
      agentSessions: [{ lastUsedAt: new Date("2026-08-04T00:00:00Z") }, { lastUsedAt: null }],
    };
    expect(guestSubmissionLastActivity(candidate)).toEqual(new Date("2026-08-04T00:00:00Z"));
  });
});
