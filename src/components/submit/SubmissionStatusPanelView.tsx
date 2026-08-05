import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/csr/UploadSimple";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import type { ReactNode } from "react";
import type { SubmissionRecord } from "../../data/submissions";
import {
  Button,
  Checkbox,
  StatusBadge,
  typographyClassName,
  type StatusBadgeTone,
} from "../../design-system/components";
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
        {publishedActions}
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
        <p className="mt-2 text-sm leading-6 text-muted">
          Your agent has received this feedback and is working on the fixes.
        </p>
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
  const tone: StatusBadgeTone =
    status === "pass" ? "positive" : status === "warning" ? "caution" : "negative";

  return (
    <StatusBadge tone={tone} className="mt-0.5 shrink-0 gap-1.5">
      {status === "pass" ? (
        <CheckIcon className="size-3" weight="bold" aria-hidden="true" />
      ) : status === "warning" ? (
        <WarningIcon className="size-3" weight="bold" aria-hidden="true" />
      ) : (
        <XIcon className="size-3" weight="bold" aria-hidden="true" />
      )}
      {label}
    </StatusBadge>
  );
}
