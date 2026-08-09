import type { RefObject } from "react";
import type { SubmissionRecord, SubmissionStage } from "../../data/submissions";
import type { PublicationOutcome } from "../../submissions/useSubmissionController";
import { Button, Panel, typographyClassName } from "../../design-system/components";
import { LogoMark } from "../../design-system/components";
import { SystemDetails } from "../SystemDetails";
import { SystemPreview } from "../SystemPreview";
import { AgentPromptPanel } from "./AgentPromptPanel";
import { SubmissionStatusPanel } from "./SubmissionStatusPanel";

export function SubmissionSidebar({
  submission,
  stage,
  onPublish,
  publishing,
  reviewingDraft,
  publishConflict,
  publicationOutcome,
  onReviewLatestDraft,
  onDiscardChanges,
  discardButtonRef,
  onStopEditing,
  stopping,
}: {
  submission: SubmissionRecord | null;
  stage: SubmissionStage;
  onPublish: () => void;
  publishing: boolean;
  reviewingDraft: boolean;
  publishConflict: boolean;
  publicationOutcome: PublicationOutcome | null;
  onReviewLatestDraft: () => Promise<boolean>;
  onDiscardChanges: () => void;
  discardButtonRef: RefObject<HTMLButtonElement | null>;
  onStopEditing: () => Promise<unknown>;
  stopping: boolean;
}) {
  if (submission) {
    const isUnchangedPublishedEdit = Boolean(
      submission.publication?.isEditing && !submission.publication.hasDraftChanges,
    );

    if (isUnchangedPublishedEdit) {
      return (
        <div>
          <AgentPromptPanel />
          <Button
            variant="quiet"
            className="mt-3 w-full"
            disabled={stopping}
            aria-busy={stopping}
            onClick={() => void onStopEditing()}
          >
            {stopping ? "Stopping..." : "Stop editing"}
          </Button>
        </div>
      );
    }

    return (
      <div className="lg:flex lg:h-[calc(100vh-7rem)] lg:max-h-[48rem] lg:min-h-[32rem] lg:flex-col">
        <SubmissionStatusPanel
          submission={submission}
          onPublish={onPublish}
          publishing={publishing}
          reviewingDraft={reviewingDraft}
          publishConflict={publishConflict}
          publicationOutcome={publicationOutcome}
          onReviewLatestDraft={onReviewLatestDraft}
          onDiscardChanges={onDiscardChanges}
          discardButtonRef={discardButtonRef}
        />
        {stage !== "published" && !publicationOutcome && (
          <div className="mt-8 shrink-0 lg:mt-auto lg:pt-8">
            <AgentPromptPanel collapsed />
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <section aria-labelledby="agent-workflow-title">
        <h2 id="agent-workflow-title" className={typographyClassName("cardTitle", "text-xl")}>
          Send to your agent
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Copy the prompt into your coding agent. The preview and checks will update when it submits
          a draft.
        </p>
      </section>
      <div className="mt-5">
        <AgentPromptPanel />
      </div>
    </>
  );
}

export function SubmissionPreview({ submission }: { submission: SubmissionRecord | null }) {
  const isEditingPublishedSystem = Boolean(submission?.publication?.isEditing);

  return (
    <section
      className="min-w-0 lg:col-start-1 lg:row-start-1"
      aria-labelledby="draft-preview-title"
    >
      <h2 id="draft-preview-title" className={typographyClassName("cardTitle", "text-xl")}>
        {isEditingPublishedSystem ? "Draft preview" : "Preview"}
      </h2>
      {isEditingPublishedSystem && (
        <p className="mt-2 text-sm leading-6 text-muted">
          Only you can see this draft until you publish changes.
        </p>
      )}
      {submission ? (
        <>
          <div
            className={`${isEditingPublishedSystem ? "mt-3" : "mt-4"} overflow-hidden rounded-panel`}
          >
            <SystemPreview system={submission.system} projection="detail" />
          </div>
          <SystemDetails system={submission.system} />
        </>
      ) : (
        <WaitingDraftPreview />
      )}
    </section>
  );
}

function WaitingDraftPreview() {
  return (
    <Panel
      className="relative mt-4 min-h-[26rem] overflow-hidden sm:min-h-[36rem]"
      aria-label="Draft preview placeholder"
    >
      <div
        className="pointer-events-none absolute inset-0 grid gap-8 p-5 opacity-35 grayscale sm:p-8"
        aria-hidden="true"
      >
        <div className="space-y-3">
          <div className="h-3 w-24 rounded-full bg-muted/40" />
          <div className="h-9 w-2/5 rounded bg-ink/20" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="space-y-4 border-t border-line pt-5">
              <div className="h-3 w-20 rounded-full bg-muted/40" />
              <div className="h-11 rounded-ui border border-line bg-paper" />
              <div className="h-24 rounded-ui border border-line bg-paper" />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 grid place-items-center bg-paper/60 p-6 backdrop-blur-[2px]">
        <div className="max-w-sm text-center" role="status" aria-live="polite">
          <LogoMark animated className="mx-auto size-10 text-brand" />
          <h3 className={typographyClassName("cardTitle", "mt-5 text-2xl")}>
            Waiting for submission
          </h3>
        </div>
      </div>
    </Panel>
  );
}
