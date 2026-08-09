import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { useRef, useState } from "react";
import { Link } from "wasp/client/router";
import { AppShell } from "../components/AppShell";
import { LoadingPage } from "../components/LoadingPage";
import { SignInDialog } from "../components/auth/SignInDialog";
import { SubmitOnboardingDialog } from "../components/submit/SubmitOnboardingDialog";
import { SubmissionPreview, SubmissionSidebar } from "../components/submit/SubmissionWorkspace";
import {
  Button,
  ConfirmationDialog,
  PageContainer,
  typographyClassName,
} from "../design-system/components";
import { SubmissionProvider, useSubmissions } from "../submissions/SubmissionProvider";
import { useDiscardDraftFlow } from "../submissions/useDiscardDraftFlow";

export function SubmitPage() {
  return (
    <SubmissionProvider>
      <SubmitContent />
    </SubmissionProvider>
  );
}

function SubmitContent() {
  const {
    stage,
    currentSubmission,
    user,
    signInToPublish,
    publish,
    loading,
    error,
    publishing,
    reviewingDraft,
    publishError,
    publishConflict,
    publicationOutcome,
    reviewLatestDraft,
    discardDraft,
  } = useSubmissions();
  const [signInOpen, setSignInOpen] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const discardButtonRef = useRef<HTMLButtonElement>(null);
  const isEditingPublishedSystem =
    !publicationOutcome && Boolean(currentSubmission?.publication?.isEditing);
  const hasDraftChanges = Boolean(currentSubmission?.publication?.hasDraftChanges);
  const discardFlow = useDiscardDraftFlow({
    onDiscard: () =>
      currentSubmission
        ? discardDraft(currentSubmission.id, currentSubmission.revision)
        : Promise.resolve("error"),
    onReviewLatestDraft: reviewLatestDraft,
    onConflict: () => setDiscardDialogOpen(true),
  });

  function handlePublish() {
    if (user) void publish();
    else setSignInOpen(true);
  }

  function handleDiscardDialogOpenChange(open: boolean) {
    setDiscardDialogOpen(open);
    if (open) discardFlow.reset();
  }

  if (loading) return <LoadingPage label="Loading submission" />;

  return (
    <AppShell>
      <PageContainer className="pb-24 pt-5">
        <header className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className={typographyClassName("cardTitle", "text-2xl")}>
              {isEditingPublishedSystem
                ? `Editing ${currentSubmission?.system.name}`
                : currentSubmission
                  ? currentSubmission.system.name
                  : "New submission"}
            </h1>
            {isEditingPublishedSystem && currentSubmission?.publication && (
              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
                <span className="inline-flex items-center gap-1.5 font-semibold text-positive">
                  <CheckCircleIcon className="size-4" weight="fill" aria-hidden="true" />
                  Published version live
                </span>
                <Link
                  to="/systems/:slug"
                  params={{ slug: currentSubmission.publication.slug }}
                  className="font-semibold text-ink underline decoration-line underline-offset-4 hover:decoration-brand"
                >
                  View published version
                </Link>
              </p>
            )}
          </div>
          {isEditingPublishedSystem && hasDraftChanges && (
            <Button
              ref={discardButtonRef}
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => handleDiscardDialogOpenChange(true)}
            >
              Discard draft changes
            </Button>
          )}
        </header>
        {error && (
          <p className="mt-4 text-sm text-negative" role="alert">
            {error}
          </p>
        )}
        <p className="sr-only" aria-live="polite">
          {stage === "waiting"
            ? "Waiting for submission."
            : stage === "feedback"
              ? "Submission received. Review issues."
              : stage === "valid"
                ? "Submission valid. Ready to publish."
                : "Submission published."}
        </p>

        <div className="mt-6 grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-7">
          <SubmissionPreview submission={currentSubmission} />
          <aside className="min-w-0 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1">
            <SubmissionSidebar
              submission={currentSubmission}
              stage={stage}
              onPublish={handlePublish}
              publishing={publishing}
              reviewingDraft={reviewingDraft}
              publishError={publishError}
              publishConflict={publishConflict}
              publicationOutcome={publicationOutcome}
              onReviewLatestDraft={reviewLatestDraft}
              onStopEditing={discardFlow.discard}
              stopping={discardFlow.discarding}
              stopError={discardFlow.error}
            />
          </aside>
        </div>
      </PageContainer>
      <SubmitOnboardingDialog />
      <SignInDialog
        open={signInOpen}
        onOpenChange={setSignInOpen}
        intent="publish"
        onSignIn={signInToPublish}
      />
      {currentSubmission && (
        <ConfirmationDialog
          open={discardDialogOpen}
          onOpenChange={handleDiscardDialogOpenChange}
          title={discardFlow.conflict ? "Draft changed" : "Discard draft changes?"}
          description={
            discardFlow.conflict
              ? "Review the latest version before deciding whether to discard it."
              : `Unpublished changes will be lost. ${currentSubmission.system.name} will remain published, and agent access will end.`
          }
          actionLabel={discardFlow.conflict ? "Review latest draft" : "Discard draft changes"}
          actionPendingLabel={discardFlow.reviewing ? "Reviewing draft..." : "Discarding draft..."}
          actionVariant={discardFlow.conflict ? "primary" : "destructive"}
          pending={discardFlow.discarding || discardFlow.reviewing}
          error={discardFlow.error}
          finalFocus={discardButtonRef}
          onAction={discardFlow.conflict ? discardFlow.reviewLatestDraft : discardFlow.discard}
        />
      )}
    </AppShell>
  );
}
