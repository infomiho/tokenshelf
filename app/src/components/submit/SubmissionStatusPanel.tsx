import { useState } from "react";
import { Link } from "wasp/client/router";
import type { SubmissionRecord } from "../../data/submissions";
import { buttonClassName } from "../../design-system/components";
import { SubmissionStatusPanelView } from "./SubmissionStatusPanelView";

export function SubmissionStatusPanel({
  submission,
  onPublish,
  publishing,
  publishError,
}: {
  submission: SubmissionRecord;
  onPublish: () => void;
  publishing: boolean;
  publishError: string | null;
}) {
  const [rightsConfirmed, setRightsConfirmed] = useState(false);

  const publishedActions = (
    <>
      <Link
        to="/systems/:slug"
        params={{ slug: submission.system.id }}
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
      publishError={publishError}
      publishedActions={publishedActions}
      rightsConfirmed={rightsConfirmed}
      onRightsConfirmedChange={setRightsConfirmed}
    />
  );
}
