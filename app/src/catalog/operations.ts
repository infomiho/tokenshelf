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
import type { FeaturedSystemData, SystemCardData, TagSuggestion } from "../data/catalog";
import { normalizeTagKey, normalizeTags } from "../domain/design-system/tags";
import { normalizePublicUsername } from "../lib/usernames";
import { utcDate } from "../infrastructure/security";
import {
  catalogService,
  createFeaturedSystemSelection,
  createSystemCardSelection,
  loadSystems,
  toCatalogSystem,
  toFeaturedSystems,
  toSystemCards,
  type CatalogSystemView,
} from "./persistence";
type CatalogHomeView = {
  dailyPick: FeaturedSystemData | null;
  previousPicks: SystemCardData[];
  latestSystems: SystemCardData[];
  hasPublishedSystems: boolean;
};

type PublicUserProfileView = {
  name: string;
  username: string;
  avatarUrl: string | null;
  systems: SystemCardData[];
};

export const getCatalogHome: GetCatalogHome<void, CatalogHomeView> = async () => {
  const [picks, latestSystemRecords] = await prisma.$transaction([
    prisma.dailyPick.findMany({
      where: { winner: { lifecycle: "PUBLISHED" } },
      orderBy: { featuredDate: "desc" },
      take: 5,
      select: { winnerId: true, winner: { select: createFeaturedSystemSelection() } },
    }),
    prisma.designSystem.findMany({
      where: { lifecycle: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { id: "asc" }],
      take: 5,
      select: createSystemCardSelection(),
    }),
  ]);
  const [featuredSystems, latestSystems] = await Promise.all([
    toFeaturedSystems(picks.map(({ winner }) => winner)),
    toSystemCards(latestSystemRecords),
  ]);
  return {
    dailyPick: featuredSystems[0] ?? null,
    previousPicks: featuredSystems.slice(1).map(({ renderer: _renderer, ...card }) => card),
    latestSystems,
    hasPublishedSystems: latestSystems.length > 0,
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
  const result = await catalogService.list({
    query: args.query,
    sort: args.mode,
    page: args.page,
    pageSize: args.pageSize,
  });
  return {
    items: result.items.map((system) => ({
      id: system.slug,
      databaseId: system.id,
      name: system.name,
      description: system.summary,
      tags: system.tags,
      copies: system.copies,
      todayCopies: system.todayCopies,
      votes: system.votes,
      pickedOn: system.pickedOn,
      publishedAt: system.publishedAt,
      screenshot: system.screenshot,
    })),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
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

export const getSystem: GetSystem<{ slug: string }, CatalogSystemView> = async (args) => {
  const systems = await loadSystems({ slug: args.slug, lifecycle: "PUBLISHED" }, { take: 1 });
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
  { slug: string; voted: boolean },
  { votes: number; voted: boolean }
> = async (args, context) => {
  if (!context.user) throw new HttpError(401, "Sign in to vote.");
  const system = await context.entities.DesignSystem.findFirst({
    where: { slug: args.slug, lifecycle: "PUBLISHED" },
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
