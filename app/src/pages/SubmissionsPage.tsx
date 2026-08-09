import { useRef, useState } from "react";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
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
  useToast,
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
  const toast = useToast();
  const [signInOpen, setSignInOpen] = useState(false);
  const [mutation, setMutation] = useState<SubmissionMutation | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useDocumentTitle("Your design systems | Tokenshelf");

  async function editOwnedSubmission(submissionId: string) {
    if (mutation) return false;
    toast.dismiss("submission-edit-error");
    setMutation({ kind: "edit", submissionId });
    try {
      await editSubmission(submissionId);
      return true;
    } catch {
      toast.error("Unable to start editing. Try again.", "submission-edit-error");
      return false;
    } finally {
      setMutation(null);
    }
  }

  async function deleteOwnedSubmission(submissionId: string) {
    if (mutation) return false;
    setMutation({ kind: "delete", submissionId });
    toast.dismiss("submission-delete-error");
    try {
      await deleteSubmission(submissionId);
      requestAnimationFrame(() => headingRef.current?.focus());
      return true;
    } catch {
      toast.error("Unable to delete this design system. Try again.", "submission-delete-error");
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
        {submissions.length > 0 ? (
          <div className="mt-6 divide-y divide-line border-y border-line">
            {submissions.map((submission) => (
              <SubmissionRow
                key={submission.id}
                submission={submission}
                actionState={submissionActionState(mutation, submission.id)}
                onEdit={() => editOwnedSubmission(submission.id)}
                onDelete={() => deleteOwnedSubmission(submission.id)}
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
  onEdit,
  onDelete,
}: {
  submission: SubmissionRecord;
  actionState: SubmissionActionState;
  onEdit: () => Promise<boolean>;
  onDelete: () => Promise<boolean>;
}) {
  const isEditingPublishedSystem = Boolean(submission.publication?.isEditing);
  const status = isEditingPublishedSystem
    ? "Editing"
    : submission.status === "waiting"
      ? "Draft"
      : submission.status === "feedback"
        ? "Needs fixes"
        : submission.status === "valid"
          ? "Ready"
          : "Published";
  const StatusIcon = isEditingPublishedSystem
    ? PencilSimpleIcon
    : submission.status === "waiting"
      ? ClockIcon
      : submission.status === "feedback"
        ? WarningCircleIcon
        : CheckCircleIcon;
  const statusColor = isEditingPublishedSystem
    ? "text-brand"
    : submission.status === "waiting"
      ? "text-muted"
      : submission.status === "feedback"
        ? "text-caution"
        : "text-positive";
  return (
    <article className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
      <div className="min-w-0">
        <h3 className="font-semibold">
          {submission.publication ? (
            <Link
              to="/systems/:slug"
              params={{ slug: submission.publication.slug }}
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
          {isEditingPublishedSystem ? "Draft updated" : "Updated"}{" "}
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
        editingPublishedSystem={isEditingPublishedSystem}
        onEdit={onEdit}
        onDelete={onDelete}
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
