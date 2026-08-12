import { HeadBucketCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { chromium, type Browser } from "playwright";
import type { Config } from "./config.js";
import { systemCardProfile } from "./card-profile.js";
import { isAllowedCaptureUrl, type ScreenshotRequest } from "./protocol.js";

export class ScreenshotService {
  readonly #config: Config;
  readonly #s3: S3Client;
  #browser: Browser | undefined;
  #activeCaptures = 0;

  constructor(config: Config) {
    this.#config = config;
    this.#s3 = new S3Client({
      endpoint: config.s3.endpoint,
      region: config.s3.region,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
      },
    });
  }

  async start(): Promise<void> {
    this.#browser = await chromium.launch({ headless: true });
  }

  async isReady(): Promise<boolean> {
    if (!this.isLive()) return false;
    try {
      await this.#s3.send(new HeadBucketCommand({ Bucket: this.#config.s3.bucket }), {
        abortSignal: AbortSignal.timeout(2_000),
      });
      return true;
    } catch {
      return false;
    }
  }

  isLive(): boolean {
    return this.#browser?.isConnected() ?? false;
  }

  async capture(request: ScreenshotRequest): Promise<void> {
    if (this.#activeCaptures >= this.#config.captureConcurrency) {
      throw new ScreenshotServiceBusyError();
    }
    this.#activeCaptures += 1;
    try {
      await this.#capture(request);
    } finally {
      this.#activeCaptures -= 1;
    }
  }

  async #capture(request: ScreenshotRequest): Promise<void> {
    const browser = this.#browser;
    if (!browser?.isConnected()) throw new Error("Browser is not ready.");

    const context = await browser.newContext({
      viewport: systemCardProfile.viewport,
      deviceScaleFactor: systemCardProfile.deviceScaleFactor,
    });
    try {
      const page = await context.newPage();
      page.setDefaultTimeout(this.#config.captureTimeoutMs);
      page.setDefaultNavigationTimeout(this.#config.captureTimeoutMs);
      let captureTimer: NodeJS.Timeout | undefined;
      const image = await Promise.race([
        (async () => {
          await page.goto(request.captureUrl, { waitUntil: "domcontentloaded" });
          if (!isAllowedCaptureUrl(page.url(), this.#config.captureOrigin)) {
            throw new Error("Capture page redirected to a disallowed URL.");
          }
          const target = page.locator(systemCardProfile.targetSelector);
          await target.waitFor({ state: "visible" });
          await page.locator(systemCardProfile.readySelector).waitFor({ state: "attached" });
          await page.evaluate(
            () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
          );
          return target.screenshot({ type: "webp" });
        })(),
        new Promise<never>((_, reject) => {
          captureTimer = setTimeout(
            () => reject(new Error("Screenshot capture timed out.")),
            this.#config.captureTimeoutMs,
          );
        }),
      ]).finally(() => clearTimeout(captureTimer));

      await this.#s3.send(
        new PutObjectCommand({
          Bucket: this.#config.s3.bucket,
          Key: request.objectKey,
          Body: image,
          ContentLength: image.byteLength,
          ContentType: "image/webp",
          CacheControl: "public, max-age=31536000, immutable",
        }),
        { abortSignal: AbortSignal.timeout(this.#config.s3.uploadTimeoutMs) },
      );
    } finally {
      await context.close().catch(() => undefined);
    }
  }

  async close(): Promise<void> {
    await this.#browser?.close().catch(() => undefined);
    this.#browser = undefined;
    this.#s3.destroy();
  }
}

export class ScreenshotServiceBusyError extends Error {
  constructor() {
    super("Screenshot service is at capacity.");
  }
}
