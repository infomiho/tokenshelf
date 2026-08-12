import { afterEach, describe, expect, it } from "vitest";
import { createCaptureToken, verifyCaptureToken } from "./capture-token";

const secret = "capture-secret-for-tests";

afterEach(() => delete process.env.SCREENSHOT_CAPTURE_SECRET);

describe("capture tokens", () => {
  it("binds a short-lived token to one system revision", () => {
    process.env.SCREENSHOT_CAPTURE_SECRET = secret;
    const token = createCaptureToken("system-1", 3, 1_000);

    expect(verifyCaptureToken(token, 2_000)).toEqual({
      designSystemId: "system-1",
      sourceRevision: 3,
      expiresAt: 61_000,
    });
    expect(verifyCaptureToken(token, 61_001)).toBeNull();
  });

  it("rejects tampered tokens", () => {
    process.env.SCREENSHOT_CAPTURE_SECRET = secret;
    const token = createCaptureToken("system-1", 3, 1_000);

    expect(verifyCaptureToken(`${token}x`, 2_000)).toBeNull();
  });
});
