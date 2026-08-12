import type { Prisma } from "@prisma/client";
import { prisma } from "wasp/server";
import type {
  DesignSystem,
  FeaturedSystemData,
  Inspiration,
  PreviewRenderer,
  SystemCardData,
} from "../data/catalog";
import type { DesignSystemDocument, RendererIR } from "../domain/design-system";
import { utcDate } from "../infrastructure/security";
import { normalizeTagKey } from "../domain/design-system/tags";
import { cardImageSelection, toCardScreenshot } from "../screenshots/card-image";
import { createCatalogService, type CatalogSource } from "./service";

export const createSystemDetailSelection = () =>
  ({
    id: true,
    slug: true,
    name: true,
    summary: true,
    tags: true,
    owner: {
      select: { displayName: true, githubHandle: true, avatarUrl: true },
    },
    inspiration: true,
    document: true,
    designMd: true,
    renderer: true,
    publishedAt: true,
    copyMetrics: { select: { metricDate: true, count: true } },
    votes: { where: { voteDate: utcDate() }, select: { userId: true } },
    dailyPicks: {
      orderBy: { featuredDate: "desc" as const },
      take: 1,
      select: { featuredDate: true },
    },
  }) as const;

export const createSystemCardSelection = () =>
  ({
    id: true,
    slug: true,
    name: true,
    summary: true,
    tags: true,
    ...cardImageSelection,
    publishedAt: true,
    _count: { select: { votes: { where: { voteDate: utcDate() } } } },
    dailyPicks: {
      orderBy: { featuredDate: "desc" as const },
      take: 1,
      select: { featuredDate: true },
    },
  }) as const;

export const createFeaturedSystemSelection = () =>
  ({ ...createSystemCardSelection(), renderer: true }) as const;

export const loadSystems = (
  where: Prisma.DesignSystemWhereInput,
  options: {
    orderBy?:
      | Prisma.DesignSystemOrderByWithRelationInput
      | Prisma.DesignSystemOrderByWithRelationInput[];
    skip?: number;
    take?: number;
  } = {},
) => prisma.designSystem.findMany({ where, select: createSystemDetailSelection(), ...options });

export const loadSystemCardRecords = (
  where: Prisma.DesignSystemWhereInput,
  options: {
    orderBy?:
      | Prisma.DesignSystemOrderByWithRelationInput
      | Prisma.DesignSystemOrderByWithRelationInput[];
    skip?: number;
    take?: number;
  } = {},
) => prisma.designSystem.findMany({ where, select: createSystemCardSelection(), ...options });

type StoredSystem = Awaited<ReturnType<typeof loadSystems>>[number];
type StoredSystemCard = Awaited<ReturnType<typeof loadSystemCardRecords>>[number];
type StoredFeaturedSystem = StoredSystemCard & { renderer: unknown };

function toPreviewRenderer(value: unknown): PreviewRenderer {
  const renderer = value as RendererIR;
  return {
    name: renderer.name,
    colors: renderer.colors,
    fonts: renderer.fonts,
    typography: renderer.typography,
    geometry: renderer.geometry,
    elevation: renderer.elevation,
    componentStyles: renderer.componentStyles,
    actions: renderer.actions,
    treatments: renderer.treatments,
  };
}

export async function toSystemCards(systems: StoredSystemCard[]): Promise<SystemCardData[]> {
  const systemIds = systems.map(({ id }) => id);
  if (!systemIds.length) return [];

  const [copyTotals, todayCopyMetrics] = await prisma.$transaction([
    prisma.dailyCopyMetric.groupBy({
      by: ["designSystemId"],
      where: { designSystemId: { in: systemIds } },
      _sum: { count: true },
    }),
    prisma.dailyCopyMetric.findMany({
      where: { designSystemId: { in: systemIds }, metricDate: utcDate() },
      select: { designSystemId: true, count: true },
    }),
  ]);
  const copiesBySystem = new Map(
    copyTotals.map(({ designSystemId, _sum }) => [designSystemId, _sum.count ?? 0]),
  );
  const todayCopiesBySystem = new Map(
    todayCopyMetrics.map(({ designSystemId, count }) => [designSystemId, count]),
  );

  return systems.map((system) => ({
    id: system.slug,
    databaseId: system.id,
    name: system.name,
    description: system.summary,
    tags: system.tags,
    copies: copiesBySystem.get(system.id) ?? 0,
    todayCopies: todayCopiesBySystem.get(system.id) ?? 0,
    votes: system._count.votes,
    pickedOn: system.dailyPicks[0]?.featuredDate.toISOString().slice(0, 10),
    publishedAt: system.publishedAt,
    screenshot: toCardScreenshot(system),
  }));
}

export async function toFeaturedSystems(
  systems: StoredFeaturedSystem[],
): Promise<FeaturedSystemData[]> {
  const cards = await toSystemCards(systems);
  return cards.map((card, index) => ({
    ...card,
    renderer: toPreviewRenderer(systems[index]!.renderer),
  }));
}

export const toCatalogSystem = (system: StoredSystem, viewerId?: string) => ({
  id: system.slug,
  databaseId: system.id,
  name: system.name,
  description: system.summary,
  tags: system.tags,
  author: {
    name: system.owner.displayName?.trim() || system.owner.githubHandle || "Tokenshelf creator",
    username: system.owner.githubHandle ?? undefined,
    avatarUrl: system.owner.avatarUrl ?? undefined,
  },
  inspiration: system.inspiration ? (system.inspiration as Inspiration) : undefined,
  copies: system.copyMetrics.reduce((total, metric) => total + metric.count, 0),
  todayCopies:
    system.copyMetrics.find(({ metricDate }) => metricDate.getTime() === utcDate().getTime())
      ?.count ?? 0,
  votes: system.votes.length,
  voted: Boolean(viewerId && system.votes.some(({ userId }) => userId === viewerId)),
  pickedOn: system.dailyPicks[0]?.featuredDate.toISOString().slice(0, 10),
  publishedAt: system.publishedAt,
  designMd: system.designMd,
  document: system.document as DesignSystemDocument,
  renderer: system.renderer as RendererIR,
});

export type CatalogSystemView = DesignSystem & {
  databaseId: string;
  voted: boolean;
  publishedAt: Date;
};

const toCatalogRecords = (cards: SystemCardData[]) =>
  cards.map((card) => ({
    id: card.databaseId,
    slug: card.id,
    name: card.name,
    summary: card.description,
    tags: card.tags,
    copies: card.copies,
    todayCopies: card.todayCopies,
    votes: card.votes,
    pickedOn: card.pickedOn,
    publishedAt: card.publishedAt as Date,
    screenshot: card.screenshot,
  }));

export const catalogSource: CatalogSource = {
  async listSystems({ query, sort, page, pageSize }) {
    const where = { lifecycle: "PUBLISHED" as const };
    if (!query && sort === "new") {
      const [total, systems] = await prisma.$transaction([
        prisma.designSystem.count({ where }),
        loadSystemCardRecords(where, {
          orderBy: [{ publishedAt: "desc" }, { id: "asc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);
      return { items: toCatalogRecords(await toSystemCards(systems)), total };
    }

    const candidates = (
      await prisma.designSystem.findMany({
        where,
        select: { id: true, name: true, summary: true, tags: true, publishedAt: true },
      })
    ).filter(
      (system) =>
        !query ||
        normalizeTagKey([system.name, system.summary, ...system.tags].join(" ")).includes(query),
    );
    let orderedIds: string[];

    if (sort === "new") {
      orderedIds = candidates
        .sort(
          (left, right) =>
            right.publishedAt.getTime() - left.publishedAt.getTime() ||
            left.id.localeCompare(right.id),
        )
        .slice((page - 1) * pageSize, page * pageSize)
        .map(({ id }) => id);
    } else {
      const voteCounts = await prisma.vote.groupBy({
        by: ["designSystemId"],
        where: { voteDate: utcDate(), designSystemId: { in: candidates.map(({ id }) => id) } },
        _count: { _all: true },
      });
      const counts = new Map(voteCounts.map((row) => [row.designSystemId, row._count._all]));
      orderedIds = candidates
        .sort(
          (left, right) =>
            (counts.get(right.id) ?? 0) - (counts.get(left.id) ?? 0) ||
            left.publishedAt.getTime() - right.publishedAt.getTime() ||
            left.id.localeCompare(right.id),
        )
        .slice((page - 1) * pageSize, page * pageSize)
        .map(({ id }) => id);
    }

    const records = toCatalogRecords(
      await toSystemCards(
        await loadSystemCardRecords({ id: { in: orderedIds }, lifecycle: "PUBLISHED" }),
      ),
    );
    const recordsById = new Map(records.map((record) => [record.id, record]));
    return {
      items: orderedIds.flatMap((id) => recordsById.get(id) ?? []),
      total: candidates.length,
    };
  },
  async findSystem(slug) {
    const system = await prisma.designSystem.findFirst({
      where: { slug, lifecycle: "PUBLISHED" },
      select: { designMd: true, document: true },
    });
    return system
      ? { designMd: system.designMd, document: system.document as DesignSystemDocument }
      : null;
  },
};

export const catalogService = createCatalogService(catalogSource);
