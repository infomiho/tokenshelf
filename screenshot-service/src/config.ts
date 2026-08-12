export type Config = ReturnType<typeof loadConfig>;

function required(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function positiveInteger(env: NodeJS.ProcessEnv, name: string, fallback: number): number {
  const raw = env[name];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return value;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env) {
  const captureOrigin = new URL(required(env, "CAPTURE_ORIGIN"));
  if (captureOrigin.pathname !== "/" || captureOrigin.search || captureOrigin.hash) {
    throw new Error("CAPTURE_ORIGIN must contain only a URL origin.");
  }

  const s3Endpoint = new URL(required(env, "S3_ENDPOINT"));

  return {
    port: positiveInteger(env, "PORT", 4100),
    authToken: required(env, "SCREENSHOT_SERVICE_TOKEN"),
    captureOrigin: captureOrigin.origin,
    captureConcurrency: positiveInteger(env, "CAPTURE_CONCURRENCY", 2),
    captureTimeoutMs: positiveInteger(env, "CAPTURE_TIMEOUT_MS", 15_000),
    requestBodyTimeoutMs: positiveInteger(env, "REQUEST_BODY_TIMEOUT_MS", 5_000),
    s3: {
      endpoint: s3Endpoint.href.replace(/\/$/, ""),
      region: env.S3_REGION?.trim() || "us-east-1",
      bucket: required(env, "S3_BUCKET"),
      accessKeyId: required(env, "S3_ACCESS_KEY_ID"),
      secretAccessKey: required(env, "S3_SECRET_ACCESS_KEY"),
      uploadTimeoutMs: positiveInteger(env, "S3_UPLOAD_TIMEOUT_MS", 15_000),
    },
  };
}
