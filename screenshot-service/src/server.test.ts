import { once } from "node:events";
import { afterEach, describe, expect, it } from "vitest";
import { createHttpServer } from "./server.js";
import { ScreenshotServiceBusyError } from "./service.js";
import { systemCardProfile } from "./card-profile.js";

const config = {
  authToken: "service-token",
  captureOrigin: "http://localhost:3000",
  captureTimeoutMs: 15_000,
  requestBodyTimeoutMs: 5_000,
  s3: { uploadTimeoutMs: 15_000 },
} as const;

const servers: ReturnType<typeof createHttpServer>[] = [];

afterEach(async () => {
  await Promise.all(
    servers
      .splice(0)
      .map((server) => new Promise<void>((resolve) => server.close(() => resolve()))),
  );
});

describe("screenshot server", () => {
  it("rejects captures at capacity and tells the caller to retry", async () => {
    const screenshots = {
      isLive: () => true,
      isReady: async () => true,
      capture: () => {
        throw new ScreenshotServiceBusyError();
      },
    };
    const server = createHttpServer(config, screenshots);
    servers.push(server);
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Server address unavailable.");

    const response = await fetch(`http://127.0.0.1:${address.port}/v1/screenshots`, {
      method: "POST",
      headers: { authorization: "Bearer service-token", "content-type": "application/json" },
      body: JSON.stringify({
        profile: systemCardProfile.id,
        captureUrl: "http://localhost:3000/internal/system-card-capture/?token=token",
        objectKey: "public/systems/system-id/card.webp",
      }),
    });

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("5");
  });

  it("returns no response protocol after a successful upload", async () => {
    const screenshots = {
      isLive: () => true,
      isReady: async () => true,
      capture: async () => undefined,
    };
    const server = createHttpServer(config, screenshots);
    servers.push(server);
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Server address unavailable.");

    const response = await fetch(`http://127.0.0.1:${address.port}/v1/screenshots`, {
      method: "POST",
      headers: { authorization: "Bearer service-token", "content-type": "application/json" },
      body: JSON.stringify({
        profile: systemCardProfile.id,
        captureUrl: "http://localhost:3000/internal/system-card-capture/?token=token",
        objectKey: "public/systems/system-id/card.webp",
      }),
    });

    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
  });
});
