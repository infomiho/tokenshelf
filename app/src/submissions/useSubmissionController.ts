import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { githubSignInUrl, logout, useAuth } from "wasp/client/auth";
import {
  claimGuestSubmissions,
  createSubmission,
  discardSubmissionChanges,
  getSubmissionSync,
  getSubmissionWorkspace,
  listMySubmissions,
  publishSubmission,
  reopenSubmission,
  rotateAgentCapability,
  useQuery,
  withdrawSubmission,
} from "wasp/client/operations";
import { authReturnKey } from "../auth/auth-storage";
import { toUserProfile, type AuthProfile } from "../auth/useCurrentUser";
import type { SubmissionRecord, SubmissionStage, UserProfile } from "../data/submissions";
import { useToast } from "../design-system/components";
import { formatDateTime } from "../lib/dates";

const guestTokenKey = "tokenshelf.guestCredential";
const agentSessionKey = "tokenshelf.agentSession";
const authIntentKey = "tokenshelf.authIntent";

export type SubmissionContextValue = {
  stage: SubmissionStage;
  currentSubmission: SubmissionRecord | null;
  submissions: SubmissionRecord[];
  user: UserProfile | null;
  agentSessionUrl: string | null;
  capabilityStatus: Workspace["capability"] | null;
  loading: boolean;
  submissionsLoading: boolean;
  error: string | null;
  publishing: boolean;
  reviewingDraft: boolean;
  publishConflict: boolean;
  publicationOutcome: PublicationOutcome | null;
  signIn: () => void;
  signInToPublish: () => void;
  signOut: () => void;
  publish: () => Promise<void>;
  reviewLatestDraft: () => Promise<boolean>;
  discardDraft: (
    submissionId: string,
    expectedRevision: number,
  ) => Promise<"discarded" | "conflict" | "error">;
  rotateCapability: () => Promise<void>;
  editSubmission: (submissionId: string) => Promise<void>;
  deleteSubmission: (submissionId: string) => Promise<void>;
};

export type PublicationOutcome = {
  kind: "created" | "updated";
  slug: string;
  revision: number;
};

export function useSubmissionController(): SubmissionContextValue {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const submissionId = /^\/submit\/([^/]+)$/.exec(location.pathname)?.[1];
  const [creating, setCreating] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [reviewingDraft, setReviewingDraft] = useState(false);
  const [publishConflict, setPublishConflict] = useState(false);
  const [publicationOutcome, setPublicationOutcome] = useState<PublicationOutcome | null>(null);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const creationStarted = useRef(false);
  const reviewInFlight = useRef(false);
  const mounted = useRef(false);
  const currentPath = useRef(location.pathname);
  const currentSubmissionId = useRef(submissionId);
  currentPath.current = location.pathname;
  currentSubmissionId.current = submissionId;
  const guestToken =
    typeof window === "undefined"
      ? undefined
      : (window.localStorage.getItem(guestTokenKey) ?? undefined);
  const access = { submissionId: submissionId ?? "", guestToken };
  const workspaceQuery = useQuery(getSubmissionWorkspace, access, {
    enabled: Boolean(submissionId),
  });
  const syncQuery = useQuery(getSubmissionSync, access, {
    enabled: Boolean(submissionId),
    refetchInterval: 2_500,
  });
  const submissionsQuery = useQuery(listMySubmissions, undefined, { enabled: Boolean(auth.data) });

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    setSessionUrl(
      submissionId ? window.sessionStorage.getItem(`${agentSessionKey}.${submissionId}`) : null,
    );
  }, [submissionId]);

  useEffect(() => {
    setPublishConflict(false);
    setPublicationOutcome(null);
  }, [submissionId]);

  useEffect(() => {
    const workspace = workspaceQuery.data as Workspace | undefined;
    const sync = syncQuery.data as SubmissionSync | undefined;
    if (sync?.lifecycle === "WITHDRAWN") {
      navigate("/submissions", { replace: true });
      return;
    }
    if (
      workspace &&
      sync &&
      (sync.revision !== workspace.revision ||
        sync.lifecycle !== workspace.lifecycle ||
        sync.capability.status !== workspace.capability.status)
    )
      void workspaceQuery.refetch();
  }, [
    (syncQuery.data as SubmissionSync | undefined)?.revision,
    (syncQuery.data as SubmissionSync | undefined)?.lifecycle,
    (syncQuery.data as SubmissionSync | undefined)?.capability.status,
    (workspaceQuery.data as Workspace | undefined)?.revision,
    (workspaceQuery.data as Workspace | undefined)?.lifecycle,
    (workspaceQuery.data as Workspace | undefined)?.capability.status,
    navigate,
  ]);

  useEffect(() => {
    if (location.pathname !== "/submit") {
      creationStarted.current = false;
      setCreating(false);
      setPageError(null);
      return;
    }
    if (creationStarted.current) return;
    creationStarted.current = true;
    setCreating(true);
    setPageError(null);
    void createSubmission({ guestToken })
      .then((created) => {
        if (currentPath.current !== "/submit") return;
        if (created.guestToken) window.localStorage.setItem(guestTokenKey, created.guestToken);
        window.sessionStorage.setItem(
          `${agentSessionKey}.${created.submissionId}`,
          created.agent.sessionUrl,
        );
        setCreating(false);
        navigate(`/submit/${created.submissionId}`, { replace: true });
      })
      .catch(() => {
        if (currentPath.current !== "/submit") return;
        creationStarted.current = false;
        setCreating(false);
        setPageError("Unable to create a submission. Reload the page to try again.");
      });
  }, [guestToken, location.pathname, navigate]);

  useEffect(() => {
    if (!auth.data) return;
    const returnPath = window.sessionStorage.getItem(authReturnKey);
    if (!guestToken) {
      if (returnPath) {
        window.sessionStorage.removeItem(authReturnKey);
        navigate(returnPath, { replace: true });
      }
      return;
    }
    let cancelled = false;
    toast.dismiss("submission-claim-error");
    void claimGuestSubmissions({ guestToken })
      .then(async () => {
        if (cancelled) return;
        window.localStorage.removeItem(guestTokenKey);
        await Promise.allSettled([submissionsQuery.refetch(), workspaceQuery.refetch()]);
        if (returnPath) {
          window.sessionStorage.removeItem(authReturnKey);
          navigate(returnPath, { replace: true });
        }
      })
      .catch(() => {
        if (!cancelled)
          toast.error(
            "We couldn't add the submission to your account. Your guest access still works.",
            "submission-claim-error",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [auth.data, guestToken]);

  const ownedWorkspaces = (submissionsQuery.data as Workspace[] | undefined) ?? [];
  const ownsWorkspace = ownedWorkspaces.some(({ id }) => id === submissionId);
  const workspace =
    (workspaceQuery.data as Workspace | undefined) ??
    ownedWorkspaces.find(({ id }) => id === submissionId);
  const currentSubmission =
    workspace && (workspace.revision > 0 || workspace.lifecycle === "PUBLISHED")
      ? toSubmissionRecord(workspace)
      : null;

  useEffect(() => {
    if (
      publicationOutcome &&
      workspace?.lifecycle === "OPEN" &&
      workspace.revision > publicationOutcome.revision
    )
      setPublicationOutcome(null);
  }, [publicationOutcome, workspace?.lifecycle, workspace?.revision]);

  async function publish() {
    if (!workspace || publishing) return;
    setPublishing(true);
    toast.dismiss("submission-publish-error");
    setPublishConflict(false);
    try {
      const kind = workspace.publication?.isEditing ? "updated" : "created";
      const publishCommand =
        kind === "updated"
          ? {
              submissionId: workspace.id,
              expectedRevision: workspace.revision,
              publication: "update" as const,
            }
          : {
              submissionId: workspace.id,
              expectedRevision: workspace.revision,
              publication: "create" as const,
              rightsAttestation: true as const,
            };
      const result = await publishSubmission(publishCommand);
      window.sessionStorage.removeItem(`${agentSessionKey}.${workspace.id}`);
      if (currentSubmissionId.current === workspace.id) {
        setSessionUrl(null);
        setPublicationOutcome({ kind, slug: result.slug, revision: workspace.revision });
      }
      void workspaceQuery.refetch();
    } catch (error) {
      if (currentSubmissionId.current !== workspace.id) return;
      if (isHttpConflict(error)) setPublishConflict(true);
      else
        toast.error(
          "Unable to publish. Check your connection and try again.",
          "submission-publish-error",
        );
    } finally {
      setPublishing(false);
    }
  }

  async function reviewLatestDraft() {
    if (reviewInFlight.current) return false;
    reviewInFlight.current = true;
    setReviewingDraft(true);
    toast.dismiss("submission-publish-error");
    try {
      const relevantResult = submissionId
        ? await workspaceQuery.refetch()
        : await submissionsQuery.refetch();
      if (relevantResult.isError) {
        toast.error(
          "Unable to load the latest draft. Check your connection and try again.",
          "submission-publish-error",
        );
        return false;
      }
      setPublishConflict(false);
      if (submissionId) void syncQuery.refetch();
      return true;
    } finally {
      reviewInFlight.current = false;
      setReviewingDraft(false);
    }
  }

  async function discardDraft(targetSubmissionId: string, expectedRevision: number) {
    const initiatingPath = currentPath.current;
    const targetWorkspace =
      workspace?.id === targetSubmissionId
        ? workspace
        : ownedWorkspaces.find(({ id }) => id === targetSubmissionId);
    const isStoppingUnchangedEdit = Boolean(
      targetWorkspace?.publication?.isEditing && !targetWorkspace.publication.hasDraftChanges,
    );
    toast.dismiss("submission-discard-error");
    try {
      const result = await discardSubmissionChanges({
        submissionId: targetSubmissionId,
        expectedRevision,
      });
      window.sessionStorage.removeItem(`${agentSessionKey}.${targetSubmissionId}`);
      if (mounted.current && targetSubmissionId === currentSubmissionId.current)
        setSessionUrl(null);
      if (mounted.current && currentPath.current === initiatingPath) {
        toast.success(
          isStoppingUnchangedEdit ? "Editing stopped" : "Draft changes discarded",
          "submission-success",
        );
        if (initiatingPath === "/submissions") void submissionsQuery.refetch();
        else navigate(isStoppingUnchangedEdit ? "/submissions" : `/systems/${result.slug}`);
      }
      return "discarded" as const;
    } catch (error) {
      if (isHttpConflict(error)) return "conflict" as const;
      toast.error(
        isStoppingUnchangedEdit
          ? "Unable to stop editing. Try again."
          : "Unable to discard draft changes. Try again.",
        "submission-discard-error",
      );
      return "error" as const;
    }
  }

  async function rotateCapability() {
    if (!workspace) return;
    toast.dismiss("agent-access-error");
    try {
      const result = await rotateAgentCapability({ submissionId: workspace.id, guestToken });
      window.sessionStorage.setItem(`${agentSessionKey}.${workspace.id}`, result.sessionUrl);
      setSessionUrl(result.sessionUrl);
      await workspaceQuery.refetch();
    } catch {
      toast.error(
        sessionUrl
          ? "Unable to create replacement agent access. Try again."
          : "Unable to create agent access. Try again.",
        "agent-access-error",
      );
    }
  }

  async function editOwnedSubmission(targetSubmissionId: string) {
    const target = ownedWorkspaces.find(({ id }) => id === targetSubmissionId);
    if (!target) throw new Error("Design system not found.");
    if (target.lifecycle === "PUBLISHED") {
      const result = await reopenSubmission({ submissionId: targetSubmissionId });
      window.sessionStorage.setItem(`${agentSessionKey}.${targetSubmissionId}`, result.sessionUrl);
    }
    navigate(`/submit/${targetSubmissionId}`);
  }

  async function deleteOwnedSubmission(targetSubmissionId: string) {
    const target = ownedWorkspaces.find(({ id }) => id === targetSubmissionId);
    await withdrawSubmission({ submissionId: targetSubmissionId });
    toast.success(
      target ? `${target.system.name} deleted` : "Design system deleted",
      "submission-success",
    );
  }

  function signIn(intent?: "publish") {
    window.sessionStorage.setItem(authReturnKey, location.pathname + location.search);
    if (intent) window.sessionStorage.setItem(authIntentKey, intent);
    window.location.href = githubSignInUrl;
  }

  useEffect(() => {
    if (
      !auth.data ||
      !workspace ||
      !ownsWorkspace ||
      location.pathname !== `/submit/${workspace.id}` ||
      window.sessionStorage.getItem(authIntentKey) !== "publish"
    )
      return;
    window.sessionStorage.removeItem(authIntentKey);
    void publish();
  }, [auth.data, location.pathname, ownsWorkspace, workspace?.id]);

  return {
    stage: deriveStage(workspace),
    currentSubmission,
    submissions: ownedWorkspaces.map(toSubmissionRecord),
    user: auth.data ? toUserProfile(auth.data as AuthProfile) : null,
    agentSessionUrl: sessionUrl,
    capabilityStatus: workspace?.capability ?? null,
    loading: creating || workspaceQuery.isLoading,
    submissionsLoading: auth.isLoading || (Boolean(auth.data) && submissionsQuery.isLoading),
    error: pageError || (workspaceQuery.error ? "Unable to load this submission." : null),
    publishing,
    reviewingDraft,
    publishConflict,
    publicationOutcome,
    signIn: () => signIn(),
    signInToPublish: () => signIn("publish"),
    signOut: () => {
      void logout();
    },
    publish,
    reviewLatestDraft,
    discardDraft,
    rotateCapability,
    editSubmission: editOwnedSubmission,
    deleteSubmission: deleteOwnedSubmission,
  };
}

type Workspace = {
  id: string;
  lifecycle: "OPEN" | "PUBLISHED" | "WITHDRAWN";
  revision: number;
  updatedAt: Date;
  publishedSystemId?: string | null;
  publication: SubmissionRecord["publication"];
  system: SubmissionRecord["system"];
  checks: SubmissionRecord["checks"];
  assessment: { outcome: "pass" | "fail" };
  capability: { status: "active" | "expired" | "revoked"; expiresAt: Date | null };
};

type SubmissionSync = {
  lifecycle: Workspace["lifecycle"];
  revision: number | null;
  capability: Workspace["capability"];
};

function deriveStage(workspace?: Workspace): SubmissionStage {
  if (!workspace || workspace.revision === 0) return "waiting";
  if (workspace.lifecycle === "PUBLISHED") return "published";
  return workspace.assessment.outcome === "pass" ? "valid" : "feedback";
}

function toSubmissionRecord(workspace: Workspace): SubmissionRecord {
  return {
    id: workspace.id,
    revision: workspace.revision,
    system: workspace.system,
    status: deriveStage(workspace),
    submittedAt: formatDateTime(new Date(workspace.updatedAt)),
    updatedAt: new Date(workspace.updatedAt),
    checks: workspace.checks,
    publication: workspace.publication,
  };
}

function isHttpConflict(error: unknown) {
  return (
    typeof error === "object" && error !== null && "statusCode" in error && error.statusCode === 409
  );
}
