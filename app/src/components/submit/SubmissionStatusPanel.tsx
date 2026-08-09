import { useEffect, useState } from "react";
import { Link } from "wasp/client/router";
import type { SubmissionRecord } from "../../data/submissions";
import type { PublicationOutcome } from "../../submissions/useSubmissionController";
import { buttonClassName } from "../../design-system/components";
import { SubmissionStatusPanelView } from "./SubmissionStatusPanelView";

export function SubmissionStatusPanel({
  submission,
  onPublish,
  publishing,
  reviewingDraft,
  publishError,
  publishConflict,
  publicationOutcome,
  onReviewLatestDraft,
  onStopEditing,
  stopping,
  stopError,
}: {
  submission: SubmissionRecord;
  onPublish: () => void;
  publishing: boolean;
  reviewingDraft: boolean;
  publishError: string | null;
  publishConflict: boolean;
  publicationOutcome: PublicationOutcome | null;
  onReviewLatestDraft: () => Promise<boolean>;
  onStopEditing: () => Promise<boolean>;
  stopping: boolean;
  stopError: string | null;
}) {
  const [rightsConfirmed, setRightsConfirmed] = useState(false);

  useEffect(() => {
    setRightsConfirmed(false);
  }, [submission.id, submission.revision]);

  const publishedSlug =
    publicationOutcome?.slug ?? submission.publication?.slug ?? submission.system.id;

  const publishedActions = (
    <>
      <Link
        to="/systems/:slug"
        params={{ slug: publishedSlug }}
        className={buttonClassName("primary", "w-full")}
      >
        View system
      </Link>
      <Link to="/submissions" className={buttonClassName("quiet", "mt-2 w-full")}>
        View your design systems
      </Link>
    </>
  );

  return (
    <SubmissionStatusPanelView
      submission={submission}
      onPublish={onPublish}
      publishing={publishing}
      reviewingDraft={reviewingDraft}
      publishError={publishError}
      publishConflict={publishConflict}
      publicationOutcome={publicationOutcome}
      onReviewLatestDraft={onReviewLatestDraft}
      onStopEditing={onStopEditing}
      stopping={stopping}
      stopError={stopError}
      publishedActions={publishedActions}
      rightsConfirmed={rightsConfirmed}
      onRightsConfirmedChange={setRightsConfirmed}
    />
  );
}
