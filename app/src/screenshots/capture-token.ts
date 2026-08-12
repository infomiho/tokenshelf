import { createHmac, timingSafeEqual } from "node:crypto";
import type { CaptureTokenPayload } from "./contracts";

const tokenLifetimeMs = 60_000;

function captureSecret() {
  const secret = process.env.SCREENSHOT_CAPTURE_SECRET;
  if (!secret) throw new Error("SCREENSHOT_CAPTURE_SECRET is not configured.");
  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", captureSecret()).update(payload).digest("base64url");
}

export function createCaptureToken(
  designSystemId: string,
  sourceRevision: number,
  now = Date.now(),
) {
  const payload = Buffer.from(
    JSON.stringify({ designSystemId, sourceRevision, expiresAt: now + tokenLifetimeMs }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyCaptureToken(token: string, now = Date.now()): CaptureTokenPayload | null {
  const [payload, suppliedSignature, extra] = token.split(".");
  if (!payload || !suppliedSignature || extra) return null;
  const expectedSignature = sign(payload);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;

  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString()) as CaptureTokenPayload;
    if (
      typeof value.designSystemId !== "string" ||
      !Number.isInteger(value.sourceRevision) ||
      !Number.isFinite(value.expiresAt) ||
      value.expiresAt < now
    )
      return null;
    return value;
  } catch {
    return null;
  }
}
