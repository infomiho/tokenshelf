import { describe, expect, it } from "vitest";
import { canAccessSubmission, decideAgentAuthority } from "./submission-access";

describe("submission access", () => {
  it("keeps guest access available while an OAuth claim is pending", () => {
    const guestTarget = { ownerId: null, guestSessionId: "guest-1" };
    expect(
      canAccessSubmission(guestTarget, { userId: "new-user", guestSessionId: "guest-1" }),
    ).toBe(true);
    expect(canAccessSubmission(guestTarget, { userId: "new-user", guestSessionId: "other" })).toBe(
      false,
    );
    expect(
      canAccessSubmission({ ownerId: "new-user", guestSessionId: null }, { userId: "new-user" }),
    ).toBe(true);
  });

  it("distinguishes expired, revoked, and unrelated agent authority", () => {
    const target = { id: "submission", sessionGeneration: 2 };
    const now = new Date("2026-08-03T12:00:00Z");
    expect(decideAgentAuthority(target, null, now)).toBe("forbidden");
    expect(
      decideAgentAuthority(
        target,
        { submissionId: "other", generation: 2, expiresAt: new Date("2026-08-04") },
        now,
      ),
    ).toBe("forbidden");
    expect(
      decideAgentAuthority(
        target,
        { submissionId: "submission", generation: 1, expiresAt: new Date("2026-08-04") },
        now,
      ),
    ).toBe("revoked");
    expect(
      decideAgentAuthority(
        target,
        { submissionId: "submission", generation: 2, expiresAt: now },
        now,
      ),
    ).toBe("expired");
  });
});
