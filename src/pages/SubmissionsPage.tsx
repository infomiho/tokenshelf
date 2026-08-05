import { useState } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
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
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function SubmissionsPage() {
  return (
    <SubmissionProvider>
      <SubmissionsContent />
    </SubmissionProvider>
  );
}

function SubmissionsContent() {
  const { user, submissions, submissionsLoading, signIn } = useSubmissions();
  const [signInOpen, setSignInOpen] = useState(false);
  useDocumentTitle("Your design systems | Tokenshelf");

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
        <div className="flex items-end justify-between gap-4">
          <h1 className={typographyClassName("sectionTitle")}>Your design systems</h1>
          {submissions.length > 0 && (
            <Link
              to="/submit/:submissionId?"
              params={{}}
              className={actionLinkClassName("primary")}
            >
              New submission
            </Link>
          )}
        </div>

        {submissions.length > 0 ? (
          <div className="mt-6 divide-y divide-line border-y border-line">
            {submissions.map((submission) => (
              <SubmissionRow key={submission.id} submission={submission} />
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

function SubmissionRow({ submission }: { submission: SubmissionRecord }) {
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
    <article className="grid gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
      <div>
        <h3 className="font-semibold">{submission.system.name}</h3>
        <p className="mt-1 text-sm text-muted">
          Updated{" "}
          <time dateTime={submission.updatedAt.toISOString()}>
            {formatDateTime(submission.updatedAt)}
          </time>
        </p>
      </div>
      <span
        className={`inline-flex w-fit items-center gap-1.5 text-sm font-semibold ${statusColor}`}
      >
        <StatusIcon className="size-4" weight="fill" aria-hidden="true" />
        {status}
      </span>
      {submission.status === "published" ? (
        <Link
          to="/systems/:systemId"
          params={{ systemId: submission.system.id }}
          className={actionLinkClassName("quiet", "justify-start sm:justify-center", {
            pressScale: false,
            size: "compact",
          })}
        >
          View <ArrowRightIcon className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <Link
          to="/submit/:submissionId?"
          params={{ submissionId: submission.id }}
          className={actionLinkClassName("quiet", "justify-start sm:justify-center", {
            pressScale: false,
            size: "compact",
          })}
        >
          Open <ArrowRightIcon className="size-4" aria-hidden="true" />
        </Link>
      )}
    </article>
  );
}
