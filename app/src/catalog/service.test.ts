import { describe, expect, it, vi } from "vitest";
import { createCatalogService, type CatalogSource } from "./service";

const tactile = {
  id: "system-2",
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
};
const listSystems = vi.fn<CatalogSource["listSystems"]>().mockResolvedValue({
  items: [tactile],
  total: 1,
});
const source: CatalogSource = {
  listSystems,
  async findSystem() {
    return null;
  },
};

describe("catalog service", () => {
  it("searches normalized catalog text and returns a bounded public projection", async () => {
    const catalog = createCatalogService(source);

    await expect(
      catalog.search({ query: "  DEVELOPER   TOOLS ", sort: "new", limit: 100 }),
    ).resolves.toEqual({
      items: [
        {
          slug: "tactile",
          name: "Tactile",
          summary: "Physical controls for developer tools",
          tags: ["Developer Tools"],
          copies: 20,
          todayCopies: 3,
          votes: 8,
          publishedAt: "2026-08-02T00:00:00.000Z",
        },
      ],
      query: "developer tools",
      sort: "new",
      limit: 50,
      total: 1,
    });
    expect(listSystems).toHaveBeenLastCalledWith({
      query: "developer tools",
      sort: "new",
      page: 1,
      pageSize: 50,
    });
  });

  it("returns canonical artifacts by slug", async () => {
    const document = { version: "1" } as never;
    const catalog = createCatalogService({
      ...source,
      async findSystem(slug) {
        return slug === "tactile" ? { designMd: "# Tactile\n", document } : null;
      },
    });

    await expect(catalog.get("tactile")).resolves.toEqual({ designMd: "# Tactile\n", document });
    await expect(catalog.get("missing")).resolves.toBeNull();
  });
});
