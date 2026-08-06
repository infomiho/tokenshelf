import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { githubSignInUrl, logout, useAuth } from "wasp/client/auth";
import {
  claimGuestSubmissions,
  createSubmission,
  getSubmissionSync,
  getSubmissionWorkspace,
  listMySubmissions,
  publishSubmission,
  rotateAgentCapability,
  useQuery,
} from "wasp/client/operations";
import { authReturnKey } from "../auth/auth-storage";
import { toUserProfile, type AuthProfile } from "../auth/useCurrentUser";
import type { SubmissionRecord, SubmissionStage, UserProfile } from "../data/submissions";
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
  publishError: string | null;
  signIn: () => void;
  signInToPublish: () => void;
  signOut: () => void;
  publish: () => Promise<void>;
  rotateCapability: () => Promise<void>;
};

export function useSubmissionController(): SubmissionContextValue {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const submissionId = /^\/submit\/([^/]+)$/.exec(location.pathname)?.[1];
  const [creating, setCreating] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const creationStarted = useRef(false);
  const currentPath = useRef(location.pathname);
  currentPath.current = location.pathname;
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
    setSessionUrl(
      submissionId ? window.sessionStorage.getItem(`${agentSessionKey}.${submissionId}`) : null,
    );
  }, [submissionId]);

  useEffect(() => {
    const workspace = workspaceQuery.data as Workspace | undefined;
    const sync = syncQuery.data as SubmissionSync | undefined;
    if (
      workspace &&
      sync &&
      (sync.revision !== workspace.revision ||
        sync.capability.status !== workspace.capability.status)
    )
      void workspaceQuery.refetch();
  }, [
    (syncQuery.data as SubmissionSync | undefined)?.revision,
    (syncQuery.data as SubmissionSync | undefined)?.capability.status,
    (workspaceQuery.data as Workspace | undefined)?.revision,
    (workspaceQuery.data as Workspace | undefined)?.capability.status,
  ]);

  useEffect(() => {
    if (location.pathname !== "/submit") {
      creationStarted.current = false;
      setCreating(false);
      return;
    }
    if (creationStarted.current) return;
    creationStarted.current = true;
    setCreating(true);
    setMutationError(null);
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
        setMutationError("Unable to create a submission. Reload the page to try again.");
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
    void claimGuestSubmissions({ guestToken })
      .then(async () => {
        if (cancelled) return;
        window.localStorage.removeItem(guestTokenKey);
        setMutationError(null);
        await Promise.allSettled([submissionsQuery.refetch(), workspaceQuery.refetch()]);
        if (returnPath) {
          window.sessionStorage.removeItem(authReturnKey);
          navigate(returnPath, { replace: true });
        }
      })
      .catch(() => {
        if (!cancelled)
          setMutationError(
            "Sign-in succeeded, but the submission could not be claimed. Your guest access is still available; try again.",
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

  async function publish() {
    if (!workspace || publishing) return;
    setPublishing(true);
    setPublishError(null);
    try {
      await publishSubmission({
        submissionId: workspace.id,
        expectedRevision: workspace.revision,
        rightsAttestation: true,
      });
      await workspaceQuery.refetch();
    } catch {
      setPublishError("Unable to publish. The draft may have changed; it has been refreshed.");
      await workspaceQuery.refetch();
    } finally {
      setPublishing(false);
    }
  }

  async function rotateCapability() {
    if (!workspace) return;
    setMutationError(null);
    try {
      const result = await rotateAgentCapability({ submissionId: workspace.id, guestToken });
      window.sessionStorage.setItem(`${agentSessionKey}.${workspace.id}`, result.sessionUrl);
      setSessionUrl(result.sessionUrl);
      await workspaceQuery.refetch();
    } catch {
      setMutationError("Unable to create replacement agent access. Try again.");
    }
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
    error: mutationError || (workspaceQuery.error ? "Unable to load this submission." : null),
    publishing,
    publishError,
    signIn: () => signIn(),
    signInToPublish: () => signIn("publish"),
    signOut: () => {
      void logout();
    },
    publish,
    rotateCapability,
  };
}

type Workspace = {
  id: string;
  lifecycle: "OPEN" | "PUBLISHED" | "WITHDRAWN";
  revision: number;
  updatedAt: Date;
  publishedSystemId?: string | null;
  system: SubmissionRecord["system"];
  checks: SubmissionRecord["checks"];
  assessment: { outcome: "pass" | "fail" };
  capability: { status: "active" | "expired" | "revoked"; expiresAt: Date | null };
};

type SubmissionSync = { revision: number | null; capability: Workspace["capability"] };

function deriveStage(workspace?: Workspace): SubmissionStage {
  if (!workspace || workspace.revision === 0) return "waiting";
  if (workspace.lifecycle === "PUBLISHED") return "published";
  return workspace.assessment.outcome === "pass" ? "valid" : "feedback";
}

function toSubmissionRecord(workspace: Workspace): SubmissionRecord {
  return {
    id: workspace.id,
    system: workspace.system,
    status: deriveStage(workspace),
    submittedAt: formatDateTime(new Date(workspace.updatedAt)),
    updatedAt: new Date(workspace.updatedAt),
    checks: workspace.checks,
  };
}
