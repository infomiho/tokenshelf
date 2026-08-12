import { timingSafeEqual } from "node:crypto";
import { Type, type Static } from "typebox";
import { Value } from "typebox/value";
import { systemCardProfile } from "./card-profile.js";

export const screenshotRequestSchema = Type.Object(
  {
    profile: Type.Literal(systemCardProfile.id),
    captureUrl: Type.String({ minLength: 1 }),
    objectKey: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false },
);

export type ScreenshotRequest = Static<typeof screenshotRequestSchema>;

function withoutTrailingSlash(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
}

export function isAllowedCaptureUrl(value: string, captureOrigin: string): boolean {
  let captureUrl: URL;
  try {
    captureUrl = new URL(value);
  } catch {
    return false;
  }

  return (
    captureUrl.origin === captureOrigin &&
    withoutTrailingSlash(captureUrl.pathname) ===
      withoutTrailingSlash(systemCardProfile.capturePath) &&
    !captureUrl.username &&
    !captureUrl.password &&
    !captureUrl.hash
  );
}

export function parseScreenshotRequest(value: unknown, captureOrigin: string): ScreenshotRequest {
  if (!Value.Check(screenshotRequestSchema, value)) throw new Error("Invalid request body.");

  if (!isAllowedCaptureUrl(value.captureUrl, captureOrigin)) {
    throw new Error("captureUrl is not an allowed capture URL.");
  }

  const keySegments = value.objectKey.split("/");
  const validObjectKey =
    value.objectKey.startsWith("public/systems/") &&
    value.objectKey.endsWith(".webp") &&
    keySegments.length >= 3 &&
    keySegments.every((segment) => /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(segment));
  if (!validObjectKey) throw new Error("objectKey is not an allowed screenshot key.");

  return value;
}

export function isAuthorized(authorization: string | undefined, expectedToken: string): boolean {
  if (!authorization?.startsWith("Bearer ")) return false;
  const supplied = Buffer.from(authorization.slice("Bearer ".length));
  const expected = Buffer.from(expectedToken);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
