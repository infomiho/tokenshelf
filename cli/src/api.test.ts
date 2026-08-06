import { createServer } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { createApi } from "./api.js";

const servers: ReturnType<typeof createServer>[] = [];

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve))),
  );
});

describe("Tokenshelf API client", () => {
  it("requests versioned catalog search with query parameters", async () => {
    const server = createServer((request, response) => {
      expect(request.url).toBe("/v1/systems?q=developer+tools&sort=new&limit=5");
      response.setHeader("content-type", "application/json");
      response.end(JSON.stringify({ items: [], total: 0 }));
    });
    servers.push(server);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server did not start.");
    const api = createApi(`http://127.0.0.1:${address.port}`);

    await expect(api.search({ query: "developer tools", sort: "new", limit: 5 })).resolves.toEqual({
      items: [],
      total: 0,
    });
  });
});
