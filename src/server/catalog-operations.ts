import { HttpError, prisma } from "wasp/server";
import type {
  GetCatalogHome,
  GetSystem,
  GetUserProfile,
  GetViewerVotes,
  ListSystems,
  SetVote,
} from "wasp/server/operations";
import type { DesignSystem } from "../data/catalog";
import type { Inspiration } from "../data/catalog";
import type { DesignSystemDocument, RendererIR } from "../data/design-document";
import { normalizePublicUsername } from "../lib/usernames";
import { utcDate } from "./security";

const publicSystemSelection = {
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
} as const;

type StoredSystem = Awaited<ReturnType<typeof loadSystems>>[number];

const loadSystems = (
  where: Record<string, unknown>,
  options: { orderBy?: Record<string, unknown>; skip?: number; take?: number } = {},
) => prisma.designSystem.findMany({ where, select: publicSystemSelection, ...options });

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
  systems: CatalogSystemView[];
  dailyPick: CatalogSystemView | null;
  previousPicks: CatalogSystemView[];
};

type PublicUserProfileView = {
  name: string;
  username: string;
  avatarUrl: string | null;
  systems: CatalogSystemView[];
};

export const getCatalogHome: GetCatalogHome<void, CatalogHomeView> = async () => {
  const picks = await prisma.dailyPick.findMany({
    where: { winner: { lifecycle: "PUBLISHED" } },
    orderBy: { featuredDate: "desc" },
    take: 5,
    select: { winnerId: true, winner: { select: publicSystemSelection } },
  });
  const systems = picks.map(({ winner }) => toCatalogSystem(winner));
  return { systems, dailyPick: systems[0] ?? null, previousPicks: systems.slice(1) };
};

type ListInput = {
  mode: "hot" | "new";
  query?: string;
  vibe?: string;
  page?: number;
  pageSize?: number;
};
type SystemPageView = { items: CatalogSystemView[]; page: number; pageSize: number; total: number };

export const listSystems: ListSystems<ListInput, SystemPageView> = async (args) => {
  const page = Math.max(1, args.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, args.pageSize ?? 18));
  const query = args.query?.trim();
  const where = {
    lifecycle: "PUBLISHED" as const,
    ...(args.vibe && args.vibe !== "All" ? { tags: { has: args.vibe } } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { summary: { contains: query, mode: "insensitive" as const } },
            { tags: { has: query } },
          ],
        }
      : {}),
  };
  const total = await prisma.designSystem.count({ where });
  if (args.mode === "new") {
    const systems = await loadSystems(where, {
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { items: systems.map((system) => toCatalogSystem(system)), page, pageSize, total };
  }

  const candidates = await prisma.designSystem.findMany({
    where,
    select: { id: true, publishedAt: true },
  });
  const voteCounts = await prisma.vote.groupBy({
    by: ["designSystemId"],
    where: { voteDate: utcDate(), designSystemId: { in: candidates.map(({ id }) => id) } },
    _count: { _all: true },
  });
  const counts = new Map(voteCounts.map((row) => [row.designSystemId, row._count._all]));
  const orderedIds = candidates
    .sort(
      (left, right) =>
        (counts.get(right.id) ?? 0) - (counts.get(left.id) ?? 0) ||
        left.publishedAt.getTime() - right.publishedAt.getTime() ||
        left.id.localeCompare(right.id),
    )
    .slice((page - 1) * pageSize, page * pageSize)
    .map(({ id }) => id);
  const systems = await loadSystems({ id: { in: orderedIds } });
  const byId = new Map(systems.map((system) => [system.id, toCatalogSystem(system)]));
  return { items: orderedIds.flatMap((id) => byId.get(id) ?? []), page, pageSize, total };
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
        select: publicSystemSelection,
      },
    },
  });
  if (!user?.githubHandle) return null;
  return {
    name: user.displayName?.trim() || user.githubHandle,
    username: user.githubHandle,
    avatarUrl: user.avatarUrl,
    systems: user.designSystems.map((system) => toCatalogSystem(system)),
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
