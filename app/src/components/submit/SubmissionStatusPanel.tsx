import { useEffect, useState, type RefObject } from "react";
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
  publishConflict,
  publicationOutcome,
  onReviewLatestDraft,
  onDiscardChanges,
  discardButtonRef,
}: {
  submission: SubmissionRecord;
  onPublish: () => void;
  publishing: boolean;
  reviewingDraft: boolean;
  publishConflict: boolean;
  publicationOutcome: PublicationOutcome | null;
  onReviewLatestDraft: () => Promise<boolean>;
  onDiscardChanges: () => void;
  discardButtonRef: RefObject<HTMLButtonElement | null>;
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
      publishConflict={publishConflict}
      publicationOutcome={publicationOutcome}
      onReviewLatestDraft={onReviewLatestDraft}
      onDiscardChanges={onDiscardChanges}
      discardButtonRef={discardButtonRef}
      publishedActions={publishedActions}
      rightsConfirmed={rightsConfirmed}
      onRightsConfirmedChange={setRightsConfirmed}
    />
  );
}
