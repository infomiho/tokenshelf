import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { Config } from "./config.js";
import { isAuthorized, parseScreenshotRequest } from "./protocol.js";
import { ScreenshotServiceBusyError, type ScreenshotService } from "./service.js";

const maxBodyBytes = 16 * 1024;

type HttpServerConfig = Pick<
  Config,
  "authToken" | "captureOrigin" | "captureTimeoutMs" | "requestBodyTimeoutMs"
> & { s3: Pick<Config["s3"], "uploadTimeoutMs"> };
type ScreenshotOperations = Pick<ScreenshotService, "isLive" | "isReady" | "capture">;

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

async function readJson(request: IncomingMessage, timeoutMs: number): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  const timeout = setTimeout(
    () => request.destroy(new Error("Request body timed out.")),
    timeoutMs,
  );
  try {
    for await (const chunk of request) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += buffer.byteLength;
      if (size > maxBodyBytes) throw new Error("Request body is too large.");
      chunks.push(buffer);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } finally {
    clearTimeout(timeout);
  }
}

export function createHttpServer(
  config: HttpServerConfig,
  screenshots: ScreenshotOperations,
): Server {
  const server = createServer(async (request, response) => {
    try {
      if (request.method === "GET" && request.url === "/health/live") {
        const live = screenshots.isLive();
        return sendJson(response, live ? 200 : 503, { status: live ? "live" : "not-live" });
      }

      if (request.method === "GET" && request.url === "/health/ready") {
        const ready = await screenshots.isReady();
        return sendJson(response, ready ? 200 : 503, { status: ready ? "ready" : "not-ready" });
      }

      if (request.method !== "POST" || request.url !== "/v1/screenshots") {
        return sendJson(response, 404, { error: "Not found." });
      }
      if (!isAuthorized(request.headers.authorization, config.authToken)) {
        response.setHeader("www-authenticate", "Bearer");
        return sendJson(response, 401, { error: "Unauthorized." });
      }
      if (request.headers["content-type"]?.split(";", 1)[0]?.trim() !== "application/json") {
        return sendJson(response, 415, { error: "Content-Type must be application/json." });
      }

      let captureRequest;
      try {
        captureRequest = parseScreenshotRequest(
          await readJson(request, config.requestBodyTimeoutMs),
          config.captureOrigin,
        );
      } catch (error) {
        return sendJson(response, 400, {
          error: error instanceof Error ? error.message : "Invalid request body.",
        });
      }

      await screenshots.capture(captureRequest);
      response.writeHead(204);
      return response.end();
    } catch (error) {
      if (error instanceof ScreenshotServiceBusyError && !response.headersSent) {
        response.setHeader("retry-after", "5");
        return sendJson(response, 429, { error: error.message });
      }
      console.error(error);
      if (!response.headersSent) sendJson(response, 500, { error: "Screenshot capture failed." });
      else response.destroy();
    }
  });

  server.headersTimeout = 10_000;
  server.requestTimeout = config.captureTimeoutMs + config.s3.uploadTimeoutMs + 5_000;
  server.keepAliveTimeout = 5_000;
  return server;
}
