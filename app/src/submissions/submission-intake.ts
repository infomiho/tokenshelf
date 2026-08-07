import {
  assessed,
  createRevisionIntake,
  hashCapability,
  type RevisionStore,
  type SessionStore,
} from "@infomiho/agent-work-protocol/server";
import { prisma } from "wasp/server";
import type { DesignSystemDocument } from "../domain/design-system";
import { designSystemModel } from "../domain/design-system/model";
import { canAccessSubmission, decideAgentAuthority } from "./submission-access";
import { retrySerializationConflict } from "./serialization";

export type SubmissionAuthority =
  | { kind: "agent"; sessionId: string; generation: number }
  | { kind: "browser"; userId?: string; guestTokenHash?: string };

export const revisionTarget = (submissionId: string) => ({
  model: designSystemModel.id,
  version: designSystemModel.version,
  document: submissionId,
});

export const submissionSessionStore: SessionStore<SubmissionAuthority> = {
  async findByCapabilityHash(capabilityHash) {
    const session = await prisma.submissionAgentSession.findUnique({
      where: { capabilityHash },
      include: { submission: true },
    });
    if (!session) return null;
    return {
      id: session.id,
      expiresAt: session.expiresAt,
      target: revisionTarget(session.submissionId),
      authority: { kind: "agent", sessionId: session.id, generation: session.generation },
    };
  },
  async touch(sessionId) {
    await prisma.submissionAgentSession.updateMany({
      where: { id: sessionId },
      data: { lastUsedAt: new Date() },
    });
  },
};

export const submissionRevisionStore: RevisionStore<DesignSystemDocument, SubmissionAuthority> = {
  async read(command) {
    if (
      command.target.model !== designSystemModel.id ||
      command.target.version !== designSystemModel.version
    )
      return { kind: "target-not-found" };
    const draft = await prisma.submissionDraft.findUnique({
      where: { submissionId: command.target.document },
      include: { submission: true },
    });
    if (!draft || draft.submission.lifecycle !== "OPEN") return { kind: "target-not-found" };
    const rejection = await authorityRejection(
      prisma,
      draft.submission,
      command.authority,
      command.now,
    );
    if (rejection) return rejection;
    return {
      kind: "read",
      revision: draft.revision,
      document: draft.document as DesignSystemDocument,
    };
  },
  async commit(command) {
    if (
      command.target.model !== designSystemModel.id ||
      command.target.version !== designSystemModel.version
    )
      return { kind: "target-not-found" };
    const commit = () =>
      prisma.$transaction(
        async (transaction) => {
          const submission = await transaction.submission.findUnique({
            where: { id: command.target.document },
          });
          if (!submission || submission.lifecycle !== "OPEN")
            return { kind: "target-not-found" } as const;
          const rejection = await authorityRejection(
            transaction,
            submission,
            command.authority,
            command.now,
          );
          if (rejection) return rejection;
          const assessment = await designSystemModel.assess(command.document);
          const updated = await transaction.submissionDraft.updateMany({
            where: { submissionId: submission.id, revision: command.expectedRevision },
            data: {
              revision: { increment: 1 },
              document: command.document,
              assessment: {
                outcome: assessment.diagnostics.some(({ severity }) => severity === "error")
                  ? "fail"
                  : "pass",
                diagnostics: assessment.diagnostics,
              },
              designMd: assessment.artifacts?.designMd,
              renderer: assessment.artifacts?.renderer,
              updatedBy: command.authority.kind,
            },
          });
          if (updated.count === 0) {
            const current = await transaction.submissionDraft.findUnique({
              where: { submissionId: submission.id },
              select: { revision: true },
            });
            return { kind: "conflict", currentRevision: current?.revision ?? null } as const;
          }
          await transaction.submission.update({
            where: { id: submission.id },
            data: { updatedAt: command.now },
          });
          return { kind: "committed", revision: command.expectedRevision + 1 } as const;
        },
        { isolationLevel: "Serializable" },
      );
    return retrySerializationConflict(commit);
  },
};

type AuthorityStore = Pick<typeof prisma, "submissionAgentSession" | "guestSession">;

async function authorityRejection(
  store: AuthorityStore,
  submission: {
    id: string;
    ownerId: string | null;
    guestSessionId: string | null;
    sessionGeneration: number;
  },
  authority: SubmissionAuthority,
  now: Date,
) {
  if (authority.kind === "agent") {
    const session = await store.submissionAgentSession.findUnique({
      where: { id: authority.sessionId },
    });
    const decision = decideAgentAuthority(submission, session, now);
    return decision === "allowed"
      ? null
      : ({ kind: "authority-rejected", reason: decision } as const);
  }
  const guest = authority.guestTokenHash
    ? await store.guestSession.findUnique({ where: { tokenHash: authority.guestTokenHash } })
    : null;
  const allowed = canAccessSubmission(submission, {
    userId: authority.userId,
    guestSessionId: guest?.claimedAt ? undefined : guest?.id,
  });
  return allowed ? null : ({ kind: "authority-rejected", reason: "forbidden" } as const);
}

export const submissionIntake = createRevisionIntake({
  model: designSystemModel,
  store: submissionRevisionStore,
  policy: assessed,
});

export const browserAuthority = (
  userId: string | undefined,
  guestToken: string | undefined,
): SubmissionAuthority => ({
  kind: "browser",
  ...(userId ? { userId } : {}),
  ...(!userId && guestToken ? { guestTokenHash: hashCapability(guestToken) } : {}),
});
