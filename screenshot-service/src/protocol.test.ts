import { describe, expect, it } from "vitest";
import { isAllowedCaptureUrl, isAuthorized, parseScreenshotRequest } from "./protocol.js";
import { systemCardProfile } from "./card-profile.js";

const origin = "http://host.docker.internal:3000";

describe("parseScreenshotRequest", () => {
  it("accepts the configured capture endpoint and a public WebP key", () => {
    expect(
      parseScreenshotRequest(
        {
          profile: systemCardProfile.id,
          captureUrl: `${origin}/internal/system-card-capture/?systemId=abc`,
          objectKey: "public/systems/abc/card.webp",
        },
        origin,
      ),
    ).toEqual({
      profile: systemCardProfile.id,
      captureUrl: `${origin}/internal/system-card-capture/?systemId=abc`,
      objectKey: "public/systems/abc/card.webp",
    });
  });

  it("accepts the capture endpoint after client-side trailing slash normalization", () => {
    const captureUrl = `${origin}/internal/system-card-capture?token=value`;
    expect(
      parseScreenshotRequest(
        {
          profile: systemCardProfile.id,
          captureUrl,
          objectKey: "public/systems/abc/card.webp",
        },
        origin,
      ).captureUrl,
    ).toBe(captureUrl);
  });

  it.each([
    "http://example.com/internal/system-card-capture/",
    `${origin}/internal/system-card-capture/extra`,
    `${origin}/internal/system-card-capture/#fragment`,
  ])("rejects capture URL %s", (captureUrl) => {
    expect(() =>
      parseScreenshotRequest(
        { profile: systemCardProfile.id, captureUrl, objectKey: "public/systems/abc.webp" },
        origin,
      ),
    ).toThrow("captureUrl");
  });

  it.each([
    "private/systems/abc.webp",
    "public/systems/../abc.webp",
    "public/systems/abc.png",
    "public/systems//abc.webp",
    "public/systems/abc card.webp",
  ])("rejects object key %s", (objectKey) => {
    expect(() =>
      parseScreenshotRequest(
        {
          profile: systemCardProfile.id,
          captureUrl: `${origin}/internal/system-card-capture/`,
          objectKey,
        },
        origin,
      ),
    ).toThrow("objectKey");
  });

  it("rejects an unknown render profile", () => {
    expect(() =>
      parseScreenshotRequest(
        {
          profile: "card-v1",
          captureUrl: `${origin}/internal/system-card-capture/`,
          objectKey: "public/systems/abc.webp",
        },
        origin,
      ),
    ).toThrow("Invalid request body");
  });
});

describe("isAllowedCaptureUrl", () => {
  it("accepts the capture route after client-side trailing slash normalization", () => {
    expect(isAllowedCaptureUrl(`${origin}/internal/system-card-capture?token=value`, origin)).toBe(
      true,
    );
  });
});

describe("isAuthorized", () => {
  it("accepts only an exact Bearer token", () => {
    expect(isAuthorized("Bearer local-token", "local-token")).toBe(true);
    expect(isAuthorized("Bearer wrong-token", "local-token")).toBe(false);
    expect(isAuthorized("Basic local-token", "local-token")).toBe(false);
    expect(isAuthorized(undefined, "local-token")).toBe(false);
  });
});
