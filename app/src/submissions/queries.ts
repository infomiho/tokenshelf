import { HttpError, prisma } from "wasp/server";
import { isDeepStrictEqual } from "node:util";
import type {
  GetCapabilityPreview,
  GetSubmissionSync,
  GetSubmissionWorkspace,
  ListMySubmissions,
} from "wasp/server/operations";
import type { DesignSystem } from "../data/catalog";
import type { DesignSystemDocument, RendererIR } from "../domain/design-system";
import { passedPublicationChecks } from "../data/submissions";
import { hashCredential } from "../infrastructure/security";
import { canAccessSubmission, decideAgentAuthority } from "./submission-access";

type WorkspaceInput = { submissionId: string; guestToken?: string };

export type SubmissionWorkspaceView = {
  id: string;
  lifecycle: "OPEN" | "PUBLISHED" | "WITHDRAWN";
  revision: number;
  assessment: {
    outcome: "pass" | "fail";
    diagnostics: Array<{
      severity: "error" | "warning" | "info";
      code: string;
      message: string;
      pointer: string;
    }>;
  };
  updatedAt: Date;
  publishedSystemId: string | null;
  publication: {
    slug: string;
    isEditing: boolean;
    hasDraftChanges: boolean;
  } | null;
  system: DesignSystem;
  checks: Array<{ id: string; label: string; detail: string; status: "pass" | "warning" | "fail" }>;
  capability: { status: "active" | "expired" | "revoked"; expiresAt: Date | null };
};

export const getSubmissionWorkspace: GetSubmissionWorkspace<
  WorkspaceInput,
  SubmissionWorkspaceView
> = async (args, context) => {
  const submission = await ownedSubmission(args, context.user?.id);
  if (submission.lifecycle === "WITHDRAWN") throw new HttpError(404, "Submission not found.");
  if (!submission.draft) throw new HttpError(404, "Draft not found.");
  return toWorkspace(submission);
};

type SubmissionSyncView = {
  lifecycle: string;
  revision: number | null;
  assessment: {
    outcome: string;
    diagnostics: Array<{
      severity: string;
      code: string;
      message: string;
      pointer: string;
      help?: string;
    }>;
  } | null;
  updatedAt: Date;
  capability: SubmissionWorkspaceView["capability"];
};

export const getSubmissionSync: GetSubmissionSync<WorkspaceInput, SubmissionSyncView> = async (
  args,
  context,
) => {
  const submission = await ownedSubmission(args, context.user?.id);
  return {
    lifecycle: submission.lifecycle,
    revision: submission.draft?.revision ?? null,
    assessment: submission.draft?.assessment as SubmissionSyncView["assessment"],
    updatedAt: submission.updatedAt,
    capability: capabilityStatus(submission),
  };
};

export const listMySubmissions: ListMySubmissions<void, SubmissionWorkspaceView[]> = async (
  _args,
  context,
) => {
  if (!context.user) throw new HttpError(401, "Sign in to view submissions.");
  const submissions = await prisma.submission.findMany({
    where: { ownerId: context.user.id, lifecycle: { not: "WITHDRAWN" } },
    include: {
      draft: true,
      publishedSystem: true,
      agentSessions: { orderBy: { generation: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });
  return submissions
    .filter(({ draft }) => draft !== null)
    .map((submission) => toWorkspace(submission));
};

async function ownedSubmission(args: WorkspaceInput, userId?: string) {
  const submission = await prisma.submission.findUnique({
    where: { id: args.submissionId },
    include: {
      draft: true,
      publishedSystem: true,
      agentSessions: { orderBy: { generation: "desc" }, take: 1 },
    },
  });
  if (!submission) throw new HttpError(404, "Submission not found.");
  const guest = args.guestToken
    ? await prisma.guestSession.findUnique({
        where: { tokenHash: hashCredential(args.guestToken) },
      })
    : null;
  if (
    canAccessSubmission(submission, {
      userId,
      guestSessionId: guest?.claimedAt ? undefined : guest?.id,
    })
  )
    return submission;
  throw new HttpError(403, "You cannot view this submission.");
}

export const getCapabilityPreview: GetCapabilityPreview<
  { capability: string },
  SubmissionWorkspaceView
> = async (args) => {
  const session = await prisma.submissionAgentSession.findUnique({
    where: { capabilityHash: hashCredential(args.capability) },
    include: {
      submission: {
        include: {
          draft: true,
          publishedSystem: true,
          agentSessions: { orderBy: { generation: "desc" }, take: 1 },
        },
      },
    },
  });
  if (!session || !session.submission.draft) throw new HttpError(404, "Capability not found.");
  const decision = decideAgentAuthority(session.submission, session, new Date());
  if (decision === "expired") throw new HttpError(410, "Capability expired.");
  if (decision === "revoked") throw new HttpError(410, "Capability revoked.");
  if (decision !== "allowed" || session.submission.lifecycle !== "OPEN")
    throw new HttpError(404, "Submission not found.");
  return toWorkspace(session.submission);
};

function toWorkspace(submission: Awaited<ReturnType<typeof ownedSubmission>>) {
  const draft = submission.draft;
  if (!draft) throw new HttpError(404, "Draft not found.");
  const document = draft.document as DesignSystemDocument;
  const assessment = draft.assessment as {
    outcome: "pass" | "fail";
    diagnostics: Array<{
      severity: "error" | "warning" | "info";
      code: string;
      message: string;
      pointer: string;
    }>;
  };
  const publication = submission.publishedSystem
    ? {
        slug: submission.publishedSystem.slug,
        isEditing: submission.lifecycle === "OPEN",
        hasDraftChanges: !isDeepStrictEqual(draft.document, submission.publishedSystem.document),
      }
    : null;
  return {
    id: submission.id,
    lifecycle: submission.lifecycle,
    revision: draft.revision,
    assessment,
    updatedAt: submission.updatedAt,
    publishedSystemId: submission.publishedSystem?.slug ?? null,
    publication,
    system: {
      id: submission.publishedSystem?.slug ?? submission.id,
      name: document.identity.name,
      description: document.identity.summary,
      tags: document.identity.tags,
      copies: 0,
      todayCopies: 0,
      votes: 0,
      designMd: draft.designMd ?? "",
      document,
      renderer: draft.renderer as RendererIR,
    },
    checks: assessment.diagnostics.length
      ? assessment.diagnostics.map((diagnostic) => ({
          id: `${diagnostic.code}:${diagnostic.pointer}`,
          label: diagnostic.code,
          detail: diagnostic.message,
          pointer: diagnostic.pointer || "/",
          status: (diagnostic.severity === "error"
            ? "fail"
            : diagnostic.severity === "warning"
              ? "warning"
              : "pass") as "fail" | "warning" | "pass",
        }))
      : passedPublicationChecks,
    capability: capabilityStatus(submission),
  };
}

function capabilityStatus(submission: Awaited<ReturnType<typeof ownedSubmission>>) {
  const session = submission.agentSessions[0];
  if (!session || session.generation !== submission.sessionGeneration)
    return { status: "revoked" as const, expiresAt: null };
  return session.expiresAt <= new Date()
    ? { status: "expired" as const, expiresAt: session.expiresAt }
    : { status: "active" as const, expiresAt: session.expiresAt };
}
