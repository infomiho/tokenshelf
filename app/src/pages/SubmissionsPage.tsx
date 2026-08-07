import { useRef, useState } from "react";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/csr/WarningCircle";
import { Link } from "wasp/client/router";
import { AppShell } from "../components/AppShell";
import { SignInDialog } from "../components/auth/SignInDialog";
import { EmptyState } from "../components/EmptyState";
import { LoadingPage } from "../components/LoadingPage";
import { PageMessage } from "../components/PageMessage";
import type { SubmissionRecord } from "../data/submissions";
import {
  actionLinkClassName,
  Button,
  PageContainer,
  typographyClassName,
} from "../design-system/components";
import { formatDateTime } from "../lib/dates";
import { SubmissionProvider, useSubmissions } from "../submissions/SubmissionProvider";
import { SubmissionActions, type SubmissionActionState } from "../submissions/SubmissionActions";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function SubmissionsPage() {
  return (
    <SubmissionProvider>
      <SubmissionsContent />
    </SubmissionProvider>
  );
}

type SubmissionMutation = {
  kind: "edit" | "delete";
  submissionId: string;
};

function SubmissionsContent() {
  const { user, submissions, submissionsLoading, signIn, editSubmission, deleteSubmission } =
    useSubmissions();
  const [signInOpen, setSignInOpen] = useState(false);
  const [mutation, setMutation] = useState<SubmissionMutation | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useDocumentTitle("Your design systems | Tokenshelf");

  async function editOwnedSubmission(submissionId: string) {
    if (mutation) return false;
    setMutation({ kind: "edit", submissionId });
    setEditError(null);
    try {
      await editSubmission(submissionId);
      return true;
    } catch {
      setEditError("Unable to edit this design system. Try again.");
      return false;
    } finally {
      setMutation(null);
    }
  }

  async function deleteOwnedSubmission(submissionId: string) {
    if (mutation) return false;
    setMutation({ kind: "delete", submissionId });
    setDeleteError(null);
    try {
      await deleteSubmission(submissionId);
      requestAnimationFrame(() => headingRef.current?.focus());
      return true;
    } catch {
      setDeleteError("Unable to delete this design system. Try again.");
      return false;
    } finally {
      setMutation(null);
    }
  }

  if (submissionsLoading) return <LoadingPage label="Loading your design systems" />;

  if (!user) {
    return (
      <AppShell>
        <PageMessage
          title="Sign in to view your design systems"
          action={<Button onClick={() => setSignInOpen(true)}>Sign in</Button>}
        />
        <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} onSignIn={signIn} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageContainer width="content" className="pb-24 pt-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h1 ref={headingRef} tabIndex={-1} className={typographyClassName("sectionTitle")}>
            Your design systems
          </h1>
          {submissions.length > 0 && (
            <Link
              to="/submit/:submissionId?"
              params={{}}
              className={actionLinkClassName("primary", "whitespace-nowrap")}
            >
              New submission
            </Link>
          )}
        </div>
        {editError && (
          <p className="mt-4 text-sm text-negative" role="alert">
            {editError}
          </p>
        )}

        {submissions.length > 0 ? (
          <div className="mt-6 divide-y divide-line border-y border-line">
            {submissions.map((submission) => (
              <SubmissionRow
                key={submission.id}
                submission={submission}
                actionState={submissionActionState(mutation, submission.id)}
                deleteError={deleteError}
                onEdit={() => editOwnedSubmission(submission.id)}
                onDelete={() => deleteOwnedSubmission(submission.id)}
                onDeleteDialogOpen={() => setDeleteError(null)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No systems yet"
            description="Give the submission prompt to your agent to start one."
            className="mt-6"
            action={
              <Link
                to="/submit/:submissionId?"
                params={{}}
                className={actionLinkClassName("onDark")}
              >
                Start a submission
              </Link>
            }
          />
        )}
      </PageContainer>
    </AppShell>
  );
}

function SubmissionRow({
  submission,
  actionState,
  deleteError,
  onEdit,
  onDelete,
  onDeleteDialogOpen,
}: {
  submission: SubmissionRecord;
  actionState: SubmissionActionState;
  deleteError: string | null;
  onEdit: () => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  onDeleteDialogOpen: () => void;
}) {
  const status =
    submission.status === "waiting"
      ? "Draft"
      : submission.status === "feedback"
        ? "Needs fixes"
        : submission.status === "valid"
          ? "Ready"
          : "Published";
  const StatusIcon =
    submission.status === "waiting"
      ? ClockIcon
      : submission.status === "feedback"
        ? WarningCircleIcon
        : CheckCircleIcon;
  const statusColor =
    submission.status === "waiting"
      ? "text-muted"
      : submission.status === "feedback"
        ? "text-caution"
        : "text-positive";
  return (
    <article className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
      <div className="min-w-0">
        <h3 className="font-semibold">
          {submission.status === "published" ? (
            <Link
              to="/systems/:slug"
              params={{ slug: submission.system.id }}
              className="text-ink underline decoration-line underline-offset-4 hover:decoration-brand"
            >
              {submission.system.name}
            </Link>
          ) : (
            <Link
              to="/submit/:submissionId?"
              params={{ submissionId: submission.id }}
              className="text-ink underline decoration-line underline-offset-4 hover:decoration-brand"
            >
              {submission.system.name}
            </Link>
          )}
        </h3>
        <p className="mt-1 text-sm text-muted">
          Updated{" "}
          <time dateTime={submission.updatedAt.toISOString()}>
            {formatDateTime(submission.updatedAt)}
          </time>
        </p>
      </div>
      <span
        className={`col-start-1 row-start-2 inline-flex w-fit items-center gap-1.5 text-sm font-semibold sm:col-start-2 sm:row-start-1 ${statusColor}`}
      >
        <StatusIcon className="size-4" weight="fill" aria-hidden="true" />
        {status}
      </span>
      <SubmissionActions
        className="col-start-2 row-span-2 row-start-1 self-start sm:col-start-3 sm:row-span-1 sm:self-center"
        name={submission.system.name}
        state={actionState}
        deleteError={deleteError}
        onEdit={onEdit}
        onDelete={onDelete}
        onDeleteDialogOpen={onDeleteDialogOpen}
      />
    </article>
  );
}

function submissionActionState(
  mutation: SubmissionMutation | null,
  submissionId: string,
): SubmissionActionState {
  if (!mutation) return "idle";
  if (mutation.submissionId !== submissionId) return "disabled";
  return mutation.kind === "edit" ? "editing" : "deleting";
}
