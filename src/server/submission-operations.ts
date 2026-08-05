import { mintCapability } from "@infomiho/agent-work-protocol/server";
import { HttpError, prisma } from "wasp/server";
import type {
  ClaimGuestSubmissions,
  CreateSubmission,
  PublishSubmission,
  RotateAgentCapability,
} from "wasp/server/operations";
import {
  assessDesignSystemDocument,
  createMinimalDesignSystemDocument,
  designSystemModel,
  type DesignSystemDocument,
} from "../data/design-document";
import { hashCredential, randomCredential } from "./security";
import { canAccessSubmission } from "./submission-access";

type GuestInput = { guestToken?: string };
type AgentSessionResult = { capability: string; sessionUrl: string; expiresAt: Date };
type CreateSubmissionResult = {
  submissionId: string;
  revision: number;
  guestToken?: string;
  agent: AgentSessionResult;
};
const serverUrl = () => (process.env.WASP_SERVER_URL ?? "http://localhost:3001").replace(/\/$/, "");

async function createSubmissionFor(
  args: GuestInput,
  userId?: string,
): Promise<CreateSubmissionResult> {
  const minted = mintCapability(serverUrl());
  const freshGuestToken = userId ? undefined : randomCredential();
  const document = createMinimalDesignSystemDocument();
  const assessment = assessDesignSystemDocument(document);
  const create = () =>
    prisma.$transaction(
      async (transaction) => {
        let guestToken: string | undefined;
        let guestSessionId: string | undefined;
        if (!userId) {
          const suppliedHash = args.guestToken ? hashCredential(args.guestToken) : undefined;
          if (suppliedHash) {
            await transaction.guestSession.updateMany({
              where: { tokenHash: suppliedHash, claimedAt: null },
              data: { lastUsedAt: new Date() },
            });
          }
          const knownGuest = suppliedHash
            ? await transaction.guestSession.findUnique({
                where: { tokenHash: suppliedHash },
                select: { id: true, claimedAt: true },
              })
            : null;
          if (knownGuest && !knownGuest.claimedAt) guestSessionId = knownGuest.id;
          else {
            guestToken = freshGuestToken;
            const guest = await transaction.guestSession.create({
              data: { tokenHash: hashCredential(freshGuestToken!) },
            });
            guestSessionId = guest.id;
          }
        }
        const reusableSubmission = await transaction.submission.findFirst({
          where: {
            lifecycle: "OPEN",
            ...(userId ? { ownerId: userId } : { guestSessionId }),
            draft: { is: { revision: 0 } },
          },
          orderBy: { createdAt: "desc" },
          select: { id: true, sessionGeneration: true },
        });
        if (reusableSubmission) {
          const generation = reusableSubmission.sessionGeneration + 1;
          await transaction.submissionAgentSession.create({
            data: {
              submissionId: reusableSubmission.id,
              capabilityHash: minted.capabilityHash,
              generation,
              expiresAt: minted.expiresAt,
            },
          });
          await transaction.submission.update({
            where: { id: reusableSubmission.id },
            data: { sessionGeneration: generation },
          });
          return {
            submissionId: reusableSubmission.id,
            revision: 0,
            ...(guestToken ? { guestToken } : {}),
            agent: {
              capability: minted.capability,
              sessionUrl: minted.sessionUrl,
              expiresAt: minted.expiresAt,
            },
          };
        }
        const submission = await transaction.submission.create({
          data: {
            ...(userId ? { ownerId: userId } : { guestSessionId }),
            draft: {
              create: {
                revision: 0,
                document,
                assessment: wireAssessment(assessment.diagnostics),
                designMd: assessment.artifacts.designMd,
                renderer: assessment.artifacts.renderer,
                updatedBy: userId ? "owner" : "guest",
              },
            },
          },
        });
        await transaction.submissionAgentSession.create({
          data: {
            submissionId: submission.id,
            capabilityHash: minted.capabilityHash,
            generation: 0,
            expiresAt: minted.expiresAt,
          },
        });
        return {
          submissionId: submission.id,
          revision: 0,
          ...(guestToken ? { guestToken } : {}),
          agent: {
            capability: minted.capability,
            sessionUrl: minted.sessionUrl,
            expiresAt: minted.expiresAt,
          },
        };
      },
      { isolationLevel: "Serializable" },
    );
  return retrySerializationConflict(create);
}

export const createSubmission: CreateSubmission<GuestInput, CreateSubmissionResult> = (
  args,
  context,
) => createSubmissionFor(args, context.user?.id);

export const claimGuestSubmissions: ClaimGuestSubmissions<GuestInput, { claimed: number }> = async (
  args,
  context,
) => {
  if (!context.user) throw new HttpError(401, "Sign in to claim submissions.");
  if (!args.guestToken) return { claimed: 0 };
  const tokenHash = hashCredential(args.guestToken);
  const claim = () =>
    prisma.$transaction(
      async (transaction) => {
        const guest = await transaction.guestSession.findUnique({ where: { tokenHash } });
        if (!guest || guest.claimedAt) return { claimed: 0 };
        const result = await transaction.submission.updateMany({
          where: { guestSessionId: guest.id, ownerId: null, lifecycle: "OPEN" },
          data: { ownerId: context.user!.id, guestSessionId: null },
        });
        await transaction.guestSession.update({
          where: { id: guest.id },
          data: { claimedAt: new Date(), claimedById: context.user!.id },
        });
        return { claimed: result.count };
      },
      { isolationLevel: "Serializable" },
    );
  return retrySerializationConflict(claim);
};

type SubmissionAccess = GuestInput & { submissionId: string };

async function rotateCapabilityFor(args: SubmissionAccess, userId?: string) {
  const minted = mintCapability(serverUrl());
  const rotate = () =>
    prisma.$transaction(
      async (transaction) => {
        const submission = await requireOwnedOpenSubmission(transaction, args, userId);
        const generation = submission.sessionGeneration + 1;
        await transaction.submissionAgentSession.create({
          data: {
            submissionId: submission.id,
            capabilityHash: minted.capabilityHash,
            generation,
            expiresAt: minted.expiresAt,
          },
        });
        await transaction.submission.update({
          where: { id: submission.id },
          data: { sessionGeneration: generation },
        });
        return {
          capability: minted.capability,
          sessionUrl: minted.sessionUrl,
          expiresAt: minted.expiresAt,
        };
      },
      { isolationLevel: "Serializable" },
    );
  return retrySerializationConflict(rotate);
}

export const rotateAgentCapability: RotateAgentCapability<SubmissionAccess, AgentSessionResult> = (
  args,
  context,
) => rotateCapabilityFor(args, context.user?.id);

type PublishInput = { submissionId: string; expectedRevision: number; rightsAttestation: boolean };

export const publishSubmission: PublishSubmission<
  PublishInput,
  { id: string; slug: string }
> = async (args, context) => {
  if (!context.user) throw new HttpError(401, "Sign in to publish.");
  if (!args.rightsAttestation) throw new HttpError(422, "Rights attestation is required.");
  return prisma.$transaction(
    async (transaction) => {
      const submission = await transaction.submission.findUnique({
        where: { id: args.submissionId },
        include: { draft: true, publishedSystem: true },
      });
      if (!submission || submission.ownerId !== context.user!.id)
        throw new HttpError(404, "Submission not found.");
      if (submission.publishedSystem)
        return { id: submission.publishedSystem.id, slug: submission.publishedSystem.slug };
      if (submission.lifecycle !== "OPEN" || !submission.draft)
        throw new HttpError(409, "Submission cannot be published.");
      if (submission.draft.revision !== args.expectedRevision)
        throw new HttpError(409, "The draft changed. Refresh and try again.");
      const assessment = await designSystemModel.assess(
        submission.draft.document as DesignSystemDocument,
      );
      const artifacts = assessment.artifacts!;
      if (assessment.diagnostics.some(({ severity }) => severity === "error"))
        throw new HttpError(422, "Resolve all errors before publishing.", {
          diagnostics: assessment.diagnostics,
        });
      const document = submission.draft.document as DesignSystemDocument;
      const slug = await uniqueSlug(transaction, document.identity.name);
      const system = await transaction.designSystem.create({
        data: {
          slug,
          ownerId: context.user!.id,
          name: document.identity.name,
          summary: document.identity.summary,
          tags: document.identity.tags,
          document,
          designMd: artifacts.designMd,
          renderer: artifacts.renderer,
          assessment: wireAssessment(assessment.diagnostics),
          validatorVersion: `${designSystemModel.id}@${designSystemModel.version}`,
          sourceSubmissionId: submission.id,
          sourceRevision: submission.draft.revision,
          rightsAttestation: true,
          rightsStatementVersion: "submission-rights-v1",
          rightsAcceptedAt: new Date(),
        },
      });
      await transaction.submission.update({
        where: { id: submission.id },
        data: { lifecycle: "PUBLISHED", sessionGeneration: { increment: 1 } },
      });
      return { id: system.id, slug: system.slug };
    },
    { isolationLevel: "Serializable" },
  );
};

type SubmissionStore = Pick<typeof prisma, "submission" | "guestSession">;

async function requireOwnedOpenSubmission(
  store: SubmissionStore,
  args: SubmissionAccess,
  userId?: string,
) {
  const submission = await store.submission.findUnique({ where: { id: args.submissionId } });
  if (!submission || submission.lifecycle !== "OPEN")
    throw new HttpError(404, "Submission not found.");
  const guest = args.guestToken
    ? await store.guestSession.findUnique({ where: { tokenHash: hashCredential(args.guestToken) } })
    : null;
  if (
    canAccessSubmission(submission, {
      userId,
      guestSessionId: guest?.claimedAt ? undefined : guest?.id,
    })
  )
    return submission;
  throw new HttpError(403, "You cannot change this submission.");
}

const isSerializationConflict = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && error.code === "P2034";

async function retrySerializationConflict<T>(run: () => Promise<T>) {
  try {
    return await run();
  } catch (error) {
    if (!isSerializationConflict(error)) throw error;
    return run();
  }
}

const wireAssessment = (
  diagnostics: readonly import("@infomiho/agent-work-protocol").Diagnostic[],
) => ({
  outcome: diagnostics.some(({ severity }) => severity === "error") ? "fail" : "pass",
  diagnostics: [...diagnostics],
});
const slugify = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "design-system";

async function uniqueSlug(
  transaction: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  name: string,
) {
  const base = slugify(name);
  const existing = await transaction.designSystem.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true },
  });
  const slugs = new Set(existing.map(({ slug }) => slug));
  if (!slugs.has(base)) return base;
  let suffix = 2;
  while (slugs.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}
