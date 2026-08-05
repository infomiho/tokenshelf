import { prisma, type PrismaClient } from "wasp/server";
import type {
  CleanupGuestSubmissions,
  FinalizeDailyPick,
  PruneCopyReceipts,
} from "wasp/server/jobs";
import { utcDate } from "./security";
import { rankDailyPickCandidates } from "../data/ranking";
import { guestSubmissionLastActivity } from "./guest-cleanup";

const dayMs = 24 * 60 * 60 * 1_000;
const cleanupBatchSize = 500;
export const dailyPickRuleVersion = "vote-only-v1";

export async function finalizeDailyPickAt(database: PrismaClient, now = new Date()) {
  const featuredDate = utcDate(now);
  const competitionDate = new Date(featuredDate.getTime() - dayMs);
  const competitionEnd = featuredDate;
  const candidates = await database.designSystem.findMany({
    where: { lifecycle: "PUBLISHED", publishedAt: { lt: competitionEnd } },
    include: { votes: { where: { voteDate: competitionDate } } },
  });
  const ranked = rankDailyPickCandidates(
    candidates.map((candidate) => ({
      ...candidate,
      voteRows: candidate.votes,
      votes: candidate.votes.length,
    })),
  );
  const winner = ranked[0];
  if (!winner) return null;
  const existing = await database.dailyPick.findUnique({ where: { featuredDate } });
  if (existing) return existing;
  return database.dailyPick.create({
    data: {
      featuredDate,
      competitionDate,
      winnerId: winner.id,
      voteSnapshot: winner.votes,
      ruleVersion: dailyPickRuleVersion,
    },
  });
}

export const finalizeDailyPick: FinalizeDailyPick<Record<string, never>, void> = async () => {
  await finalizeDailyPickAt(prisma);
};

export const cleanupGuestSubmissions: CleanupGuestSubmissions<
  Record<string, never>,
  { deleted: number }
> = async (_args, context) => {
  const cutoff = new Date(Date.now() - dayMs);
  const candidates = await context.entities.Submission.findMany({
    where: { guestSessionId: { not: null }, lifecycle: "OPEN", updatedAt: { lt: cutoff } },
    orderBy: { updatedAt: "asc" },
    take: cleanupBatchSize,
    select: {
      id: true,
      updatedAt: true,
      draft: { select: { updatedAt: true } },
      guestSession: { select: { lastUsedAt: true } },
      agentSessions: { select: { lastUsedAt: true } },
    },
  });
  const abandonedIds = candidates
    .filter((candidate) => guestSubmissionLastActivity(candidate) < cutoff)
    .map(({ id }) => id);
  const result = await context.entities.Submission.deleteMany({
    where: { id: { in: abandonedIds } },
  });
  await context.entities.GuestSession.deleteMany({
    where: { submissions: { none: {} }, lastUsedAt: { lt: cutoff } },
  });
  return { deleted: result.count };
};

export const pruneCopyReceipts: PruneCopyReceipts<
  Record<string, never>,
  { deleted: number }
> = async () => {
  const cutoff = new Date(utcDate().getTime() - 8 * dayMs);
  const result = await prisma.copyReceipt.deleteMany({ where: { receiptDate: { lt: cutoff } } });
  return { deleted: result.count };
};
