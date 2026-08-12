import type { DesignSystemDocument } from "../domain/design-system";
import type { PreviewRenderer } from "../data/catalog";
import type { CardScreenshot } from "../screenshots/contracts";
import { normalizeTagKey } from "../domain/design-system/tags";

export type CatalogSort = "hot" | "new";

export type CatalogRecord = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  tags: string[];
  copies: number;
  todayCopies: number;
  votes: number;
  pickedOn?: string;
  publishedAt: Date;
  screenshot: CardScreenshot | null;
  renderer: PreviewRenderer;
};

export type CatalogDocumentRecord = {
  designMd: string;
  document: DesignSystemDocument;
};

export type CatalogSource = {
  listSystems(input: {
    query: string;
    sort: CatalogSort;
    page: number;
    pageSize: number;
  }): Promise<{ items: CatalogRecord[]; total: number }>;
  findSystem(slug: string): Promise<CatalogDocumentRecord | null>;
};

export type PublicCatalogSystem = {
  slug: string;
  name: string;
  summary: string;
  tags: string[];
  copies: number;
  todayCopies: number;
  votes: number;
  pickedOn?: string;
  publishedAt: string;
};

export type CatalogSearchResult = {
  items: PublicCatalogSystem[];
  query: string;
  sort: CatalogSort;
  limit: number;
  total: number;
};

export type CatalogService = {
  get(slug: string): Promise<CatalogDocumentRecord | null>;
  list(input: {
    query?: string;
    sort: CatalogSort;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: CatalogRecord[]; page: number; pageSize: number; total: number }>;
  search(input: {
    query?: string;
    sort?: CatalogSort;
    limit?: number;
  }): Promise<CatalogSearchResult>;
};

export function createCatalogService(source: CatalogSource): CatalogService {
  const list: CatalogService["list"] = async (input) => {
    const query = normalizeTagKey(input.query ?? "");
    const page = Math.max(1, input.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, input.pageSize ?? 18));
    const result = await source.listSystems({ query, sort: input.sort, page, pageSize });

    return {
      items: result.items,
      page,
      pageSize,
      total: result.total,
    };
  };

  return {
    get: (slug) => source.findSystem(slug),
    list,
    async search(input) {
      const query = normalizeTagKey(input.query ?? "");
      const sort = input.sort ?? "hot";
      const limit = Math.min(50, Math.max(1, input.limit ?? 10));
      const result = await list({ query, sort, page: 1, pageSize: limit });

      return {
        items: result.items.map((system) => ({
          slug: system.slug,
          name: system.name,
          summary: system.summary,
          tags: system.tags,
          copies: system.copies,
          todayCopies: system.todayCopies,
          votes: system.votes,
          ...(system.pickedOn ? { pickedOn: system.pickedOn } : {}),
          publishedAt: system.publishedAt.toISOString(),
        })),
        query,
        sort,
        limit,
        total: result.total,
      };
    },
  };
}
