import { HttpError, prisma } from "wasp/server";
import type {
  GetCatalogHome,
  GetSystem,
  GetTagSuggestions,
  GetUserProfile,
  GetViewerVotes,
  ListSystems,
  SetVote,
} from "wasp/server/operations";
import type {
  DesignSystem,
  Inspiration,
  PreviewRenderer,
  SystemCardData,
  TagSuggestion,
} from "../data/catalog";
import type { DesignSystemDocument, RendererIR } from "../data/design-document";
import { normalizeTagKey, normalizeTags } from "../lib/tags";
import { normalizePublicUsername } from "../lib/usernames";
import { utcDate } from "./security";

const createSystemDetailSelection = () =>
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

const createSystemCardSelection = () =>
  ({
    id: true,
    slug: true,
    name: true,
    summary: true,
    tags: true,
    renderer: true,
    publishedAt: true,
    _count: { select: { votes: { where: { voteDate: utcDate() } } } },
    dailyPicks: {
      orderBy: { featuredDate: "desc" as const },
      take: 1,
      select: { featuredDate: true },
    },
  }) as const;

type StoredSystem = Awaited<ReturnType<typeof loadSystems>>[number];
type StoredSystemCard = Awaited<ReturnType<typeof loadSystemCardRecords>>[number];

const loadSystems = (
  where: Record<string, unknown>,
  options: {
    orderBy?: Record<string, unknown> | Record<string, unknown>[];
    skip?: number;
    take?: number;
  } = {},
) => prisma.designSystem.findMany({ where, select: createSystemDetailSelection(), ...options });

const loadSystemCardRecords = (
  where: Record<string, unknown>,
  options: {
    orderBy?: Record<string, unknown> | Record<string, unknown>[];
    skip?: number;
    take?: number;
  } = {},
) => prisma.designSystem.findMany({ where, select: createSystemCardSelection(), ...options });

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

async function toSystemCards(systems: StoredSystemCard[]): Promise<SystemCardData[]> {
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
    renderer: toPreviewRenderer(system.renderer),
  }));
}

const toCatalogSystem = (system: StoredSystem, viewerId?: string) => ({
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

type CatalogSystemView = DesignSystem & { databaseId: string; voted: boolean; publishedAt: Date };
type CatalogHomeView = {
  dailyPick: SystemCardData | null;
  previousPicks: SystemCardData[];
  hasPublishedSystems: boolean;
};

type PublicUserProfileView = {
  name: string;
  username: string;
  avatarUrl: string | null;
  systems: SystemCardData[];
};

export const getCatalogHome: GetCatalogHome<void, CatalogHomeView> = async () => {
  const [picks, publishedSystemCount] = await prisma.$transaction([
    prisma.dailyPick.findMany({
      where: { winner: { lifecycle: "PUBLISHED" } },
      orderBy: { featuredDate: "desc" },
      take: 5,
      select: { winnerId: true, winner: { select: createSystemCardSelection() } },
    }),
    prisma.designSystem.count({ where: { lifecycle: "PUBLISHED" } }),
  ]);
  const systems = await toSystemCards(picks.map(({ winner }) => winner));
  return {
    dailyPick: systems[0] ?? null,
    previousPicks: systems.slice(1),
    hasPublishedSystems: publishedSystemCount > 0,
  };
};

type ListInput = {
  mode: "hot" | "new";
  query?: string;
  page?: number;
  pageSize?: number;
};
type SystemPageView = { items: SystemCardData[]; page: number; pageSize: number; total: number };

export const listSystems: ListSystems<ListInput, SystemPageView> = async (args) => {
  const page = Math.max(1, args.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, args.pageSize ?? 18));
  const query = normalizeTagKey(args.query ?? "");

  if (!query && args.mode === "new") {
    const where = { lifecycle: "PUBLISHED" as const };
    const [total, systems] = await prisma.$transaction([
      prisma.designSystem.count({ where }),
      loadSystemCardRecords(where, {
        orderBy: [{ publishedAt: "desc" }, { id: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { items: await toSystemCards(systems), page, pageSize, total };
  }

  const candidates = (
    await prisma.designSystem.findMany({
      where: { lifecycle: "PUBLISHED" },
      select: { id: true, name: true, summary: true, tags: true, publishedAt: true },
    })
  ).filter(
    (system) =>
      !query ||
      normalizeTagKey([system.name, system.summary, ...system.tags].join(" ")).includes(query),
  );
  const total = candidates.length;
  let orderedIds: string[];

  if (args.mode === "new") {
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

  const systems = await toSystemCards(
    await loadSystemCardRecords({ id: { in: orderedIds }, lifecycle: "PUBLISHED" }),
  );
  const byId = new Map(systems.map((system) => [system.databaseId, system]));
  return {
    items: orderedIds.flatMap((id) => byId.get(id) ?? []),
    page,
    pageSize,
    total,
  };
};

export const getTagSuggestions: GetTagSuggestions<void, TagSuggestion[]> = async (
  _args,
  context,
) => {
  const systems = await context.entities.DesignSystem.findMany({
    where: { lifecycle: "PUBLISHED" },
    select: { tags: true },
  });
  const suggestions = new Map<string, TagSuggestion>();

  for (const { tags } of systems) {
    for (const label of normalizeTags(tags)) {
      const key = normalizeTagKey(label);
      const suggestion = suggestions.get(key) ?? { label, count: 0 };
      if (label.localeCompare(suggestion.label) < 0) suggestion.label = label;
      suggestion.count += 1;
      suggestions.set(key, suggestion);
    }
  }

  return [...suggestions.values()].sort(
    (left, right) => right.count - left.count || left.label.localeCompare(right.label),
  );
};

export const getSystem: GetSystem<{ systemId: string }, CatalogSystemView> = async (args) => {
  const systems = await loadSystems(
    { OR: [{ id: args.systemId }, { slug: args.systemId }], lifecycle: "PUBLISHED" },
    { take: 1 },
  );
  if (!systems[0]) throw new HttpError(404, "Design system not found.");
  return toCatalogSystem(systems[0]);
};

export const getUserProfile: GetUserProfile<
  { username: string },
  PublicUserProfileView | null
> = async (args) => {
  const username = normalizePublicUsername(args.username);
  if (!username) return null;
  const user = await prisma.user.findFirst({
    where: { githubHandle: { equals: username, mode: "insensitive" } },
    select: {
      displayName: true,
      githubHandle: true,
      avatarUrl: true,
      designSystems: {
        where: { lifecycle: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        select: createSystemCardSelection(),
      },
    },
  });
  if (!user?.githubHandle) return null;
  return {
    name: user.displayName?.trim() || user.githubHandle,
    username: user.githubHandle,
    avatarUrl: user.avatarUrl,
    systems: await toSystemCards(user.designSystems),
  };
};

export const getViewerVotes: GetViewerVotes<void, string[]> = async (_args, context) => {
  if (!context.user) return [];
  const votes = await context.entities.Vote.findMany({
    where: { userId: context.user.id, voteDate: utcDate() },
    select: { designSystemId: true },
  });
  return votes.map(({ designSystemId }) => designSystemId);
};

export const setVote: SetVote<
  { systemId: string; voted: boolean },
  { votes: number; voted: boolean }
> = async (args, context) => {
  if (!context.user) throw new HttpError(401, "Sign in to vote.");
  const system = await context.entities.DesignSystem.findFirst({
    where: { OR: [{ id: args.systemId }, { slug: args.systemId }], lifecycle: "PUBLISHED" },
    select: { id: true },
  });
  if (!system) throw new HttpError(404, "Design system not found.");
  const voteDate = utcDate();
  const key = {
    userId_designSystemId_voteDate: {
      userId: context.user.id,
      designSystemId: system.id,
      voteDate,
    },
  };
  if (args.voted)
    await context.entities.Vote.upsert({
      where: key,
      create: key.userId_designSystemId_voteDate,
      update: {},
    });
  else await context.entities.Vote.deleteMany({ where: key.userId_designSystemId_voteDate });
  return {
    votes: await context.entities.Vote.count({ where: { designSystemId: system.id, voteDate } }),
    voted: args.voted,
  };
};
