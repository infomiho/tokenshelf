import { systemCardProfile } from "./contracts";

export async function captureScreenshot(input: {
  profile: typeof systemCardProfile.id;
  captureUrl: string;
  objectKey: string;
}): Promise<void> {
  const serviceUrl = process.env.SCREENSHOT_SERVICE_URL ?? "http://localhost:4100";
  const token = process.env.SCREENSHOT_SERVICE_TOKEN;
  if (!token) throw new Error("SCREENSHOT_SERVICE_TOKEN is not configured.");

  const response = await fetch(`${serviceUrl.replace(/\/$/, "")}/v1/screenshots`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(40_000),
  });
  if (!response.ok) throw new Error(`Screenshot service returned ${response.status}.`);
}
