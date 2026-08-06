import { createServer } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { createDraftApi } from "./draft-api.js";

const servers: ReturnType<typeof createServer>[] = [];

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve))),
  );
});

async function startServer(handler: Parameters<typeof createServer>[0]) {
  const server = createServer(handler);
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server did not start.");
  return `http://127.0.0.1:${address.port}`;
}

describe("draft API client", () => {
  it("pulls work from the capability session URL", async () => {
    const baseUrl = await startServer((request, response) => {
      expect(request.method).toBe("GET");
      expect(request.url).toBe("/agent/sessions/capability/work");
      response.setHeader("content-type", "application/json");
      response.end(JSON.stringify({ revision: 3, document: { version: "1" } }));
    });
    const draft = createDraftApi(`${baseUrl}/agent/sessions/capability/`);

    await expect(draft.pull()).resolves.toEqual({ revision: 3, document: { version: "1" } });
  });

  it("pushes a complete document with a strong revision ETag", async () => {
    const baseUrl = await startServer(async (request, response) => {
      const chunks: Buffer[] = [];
      for await (const chunk of request) chunks.push(Buffer.from(chunk));
      expect(request.method).toBe("PUT");
      expect(request.url).toBe("/agent/sessions/capability/work");
      expect(request.headers["if-match"]).toBe('"3"');
      expect(request.headers["content-type"]).toContain("application/json");
      expect(JSON.parse(Buffer.concat(chunks).toString("utf8"))).toEqual({ version: "1" });
      response.setHeader("content-type", "application/json");
      response.end(JSON.stringify({ revision: 4, assessment: { outcome: "pass" } }));
    });
    const draft = createDraftApi(`${baseUrl}/agent/sessions/capability`);

    await expect(draft.push({ version: "1" }, 3)).resolves.toEqual({
      revision: 4,
      assessment: { outcome: "pass" },
    });
  });

  it("reports protocol errors without exposing the capability URL", async () => {
    const baseUrl = await startServer((_request, response) => {
      response.statusCode = 412;
      response.setHeader("content-type", "application/problem+json");
      response.end(
        JSON.stringify({
          code: "revision-conflict",
          detail: "Refetch secret-capability and retry.",
          currentRevision: "secret-capability",
        }),
      );
    });
    const sessionUrl = `${baseUrl}/agent/sessions/secret-capability`;
    const draft = createDraftApi(sessionUrl);

    await expect(draft.push({ version: "1" }, 3)).rejects.toThrow(
      "revision-conflict: Refetch the work and retry.",
    );
    await expect(draft.push({ version: "1" }, 3)).rejects.not.toThrow("secret-capability");
  });
});
