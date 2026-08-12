import { createServer } from "node:http";
import express from "express";
import { afterEach, describe, expect, it } from "vitest";
import { createCatalogApiHandlers } from "./api";
import { createCatalogService, type CatalogSource } from "./service";

const source: CatalogSource = {
  async listSystems() {
    return {
      items: [
        {
          id: "system-1",
          slug: "tactile",
          name: "Tactile",
          summary: "Physical controls for developer tools",
          tags: ["Developer Tools"],
          copies: 20,
          todayCopies: 3,
          votes: 8,
          publishedAt: new Date("2026-08-02T00:00:00.000Z"),
          screenshot: null,
          renderer: {} as never,
        },
      ],
      total: 1,
    };
  },
  async findSystem() {
    return null;
  },
};

const servers: ReturnType<typeof createServer>[] = [];

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve))),
  );
});

async function serve(handler: express.RequestHandler) {
  const app = express();
  app.get("/v1/systems", handler);
  const server = createServer(app);
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server did not start.");
  return `http://127.0.0.1:${address.port}`;
}

describe("catalog HTTP API", () => {
  it("serves the shared search contract", async () => {
    const handlers = createCatalogApiHandlers(createCatalogService(source));
    const baseUrl = await serve(handlers.search);

    const response = await fetch(`${baseUrl}/v1/systems?q=developer&sort=new&limit=5`);

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toMatchObject({
      query: "developer",
      sort: "new",
      limit: 5,
      total: 1,
      items: [{ slug: "tactile" }],
    });
  });

  it("serves DESIGN.md by slug with stable content headers", async () => {
    const document = { version: "1" } as never;
    const catalog = createCatalogService({
      ...source,
      async findSystem(slug) {
        return slug === "tactile" ? { designMd: "# Tactile\n", document } : null;
      },
    });
    const handlers = createCatalogApiHandlers(catalog);
    const app = express();
    app.get("/v1/systems/:slug/DESIGN.md", handlers.designMd);
    const server = createServer(app);
    servers.push(server);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server did not start.");

    const response = await fetch(`http://127.0.0.1:${address.port}/v1/systems/tactile/DESIGN.md`);

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("content-type")).toContain("text/markdown");
    expect(response.headers.get("content-disposition")).toBe('inline; filename="DESIGN.md"');
    await expect(response.text()).resolves.toBe("# Tactile\n");
  });

  it("serves canonical documents and the versioned schema", async () => {
    const document = { version: "1", identity: { name: "Tactile" } } as never;
    const catalog = createCatalogService({
      ...source,
      async findSystem() {
        return { designMd: "# Tactile\n", document };
      },
    });
    const handlers = createCatalogApiHandlers(catalog);
    const app = express();
    app.get("/v1/systems/:slug/document.json", handlers.document);
    app.get("/v1/schemas/design-system-document/1", handlers.schema);
    const server = createServer(app);
    servers.push(server);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server did not start.");
    const baseUrl = `http://127.0.0.1:${address.port}`;

    const documentResponse = await fetch(`${baseUrl}/v1/systems/tactile/document.json`);
    const schemaResponse = await fetch(`${baseUrl}/v1/schemas/design-system-document/1`);

    expect(documentResponse.headers.get("cache-control")).toBe("no-store");
    await expect(documentResponse.json()).resolves.toEqual(document);
    await expect(schemaResponse.json()).resolves.toMatchObject({
      type: "object",
      properties: { version: { const: "1" } },
    });
  });
});
