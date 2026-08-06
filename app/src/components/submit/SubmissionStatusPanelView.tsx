import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/csr/UploadSimple";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import type { ReactNode } from "react";
import type { SubmissionRecord } from "../../data/submissions";
import { Button, Checkbox, StatusIcon, typographyClassName } from "../../design-system/components";
import { formatValidationMessage, groupValidationChecks } from "../../lib/validation-checks";

type SubmissionStatusPanelViewProps = {
  submission: SubmissionRecord;
  onPublish: () => void;
  publishing: boolean;
  publishError: string | null;
  publishedActions?: ReactNode;
  rightsConfirmed: boolean;
  onRightsConfirmedChange: (confirmed: boolean) => void;
};

export function SubmissionStatusPanelView({
  submission,
  onPublish,
  publishing,
  publishError,
  publishedActions,
  rightsConfirmed,
  onRightsConfirmedChange,
}: SubmissionStatusPanelViewProps) {
  const isValid = submission.status === "valid";
  const isPublished = submission.status === "published";
  const checkGroups = groupValidationChecks(submission.checks);
  const checksAreScrollable = checkGroups.length > 5;

  if (isPublished) {
    return (
      <section aria-labelledby="submission-status-title">
        <h2 id="submission-status-title" className={typographyClassName("cardTitle", "text-xl")}>
          {submission.system.name} is published
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          This design system is live in the Tokenshelf catalog.
        </p>
        <dl className="mt-5 grid grid-cols-2 divide-x divide-line border-y border-line">
          <div className="py-4 pe-4">
            <dt className={typographyClassName("metaLabel", "text-muted")}>Status</dt>
            <dd className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-positive">
              <CheckCircleIcon className="size-4" weight="fill" aria-hidden="true" />
              Published
            </dd>
          </div>
          <div className="min-w-0 py-4 ps-4">
            <dt className={typographyClassName("metaLabel", "text-muted")}>Last submitted</dt>
            <dd className="mt-2 flex min-w-0 items-center gap-1.5 text-sm text-muted">
              <ClockIcon className="size-4 shrink-0" aria-hidden="true" />
              <time className="truncate" dateTime={submission.updatedAt.toISOString()}>
                {submission.submittedAt}
              </time>
            </dd>
          </div>
        </dl>
        {publishedActions && <div className="mt-6">{publishedActions}</div>}
      </section>
    );
  }

  return (
    <section
      className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col"
      aria-labelledby="submission-status-title"
    >
      <h2 id="submission-status-title" className={typographyClassName("cardTitle", "text-xl")}>
        {isValid ? "Ready to publish" : "Fixes needed"}
      </h2>
      {!isValid && (
        <p className="mt-2 text-sm leading-6 text-muted">Your agent is addressing the feedback.</p>
      )}
      <div className="mt-2 flex items-center text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <ClockIcon className="size-3.5" aria-hidden="true" />
          Updated {submission.submittedAt}
        </span>
      </div>
      <div
        className="mt-5 max-h-[32rem] overflow-y-auto overscroll-contain pe-2 focus-visible:outline-2 focus-visible:outline-offset-2 lg:min-h-0 lg:flex-1 [scrollbar-gutter:stable]"
        role={checksAreScrollable ? "region" : undefined}
        aria-label={checksAreScrollable ? "Review issues" : undefined}
        tabIndex={checksAreScrollable ? 0 : undefined}
      >
        <ul className="divide-y divide-line border-y border-line">
          {checkGroups.map((group) => (
            <li key={group.id} className="py-4">
              <div className="flex items-start gap-3">
                <CheckStatus status={group.status} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{group.label}</p>
                  <p className="mt-1.5 text-xs leading-5 text-muted">
                    {formatValidationMessage(group.checks[0])}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {isValid && (
        <>
          <Checkbox
            checked={rightsConfirmed}
            onCheckedChange={onRightsConfirmedChange}
            label="I have the rights to share this design-system document and its values."
            className="mt-6 border-t border-line pt-5"
          />
          {publishError && (
            <p className="mt-4 text-sm text-negative" role="alert">
              {publishError}
            </p>
          )}
          <Button
            className="mt-5 w-full"
            disabled={!rightsConfirmed || publishing}
            onClick={onPublish}
          >
            <UploadSimpleIcon className="size-4" aria-hidden="true" />
            {publishing ? "Publishing..." : "Publish"}
          </Button>
        </>
      )}
    </section>
  );
}

function CheckStatus({ status }: { status: "pass" | "warning" | "fail" }) {
  const label = status === "pass" ? "Passed" : status === "warning" ? "Warning" : "Failed";
  const tone = status === "pass" ? "positive" : status === "warning" ? "caution" : "negative";

  return (
    <StatusIcon className="mt-0.5 shrink-0" label={label} tone={tone}>
      {status === "pass" ? (
        <CheckIcon className="size-3.5" weight="bold" aria-hidden="true" />
      ) : status === "warning" ? (
        <WarningIcon className="size-3.5" weight="bold" aria-hidden="true" />
      ) : (
        <XIcon className="size-3.5" weight="bold" aria-hidden="true" />
      )}
    </StatusIcon>
  );
}
