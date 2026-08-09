import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { useRef, useState } from "react";
import { Link } from "wasp/client/router";
import { AppShell } from "../components/AppShell";
import { LoadingPage } from "../components/LoadingPage";
import { SignInDialog } from "../components/auth/SignInDialog";
import { SubmitOnboardingDialog } from "../components/submit/SubmitOnboardingDialog";
import { SubmissionPreview, SubmissionSidebar } from "../components/submit/SubmissionWorkspace";
import {
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
  }

  async function handleDiscardAction() {
    return (await discardFlow.discard()) !== "conflict";
  }

  async function handleReviewLatestDraftAction() {
    await discardFlow.reviewLatestDraft();
    return true;
  }

  if (loading) return <LoadingPage label="Loading submission" />;

  return (
    <AppShell>
      <PageContainer className="pb-24 pt-5">
        <header>
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
                Published
              </span>
              <Link
                to="/systems/:slug"
                params={{ slug: currentSubmission.publication.slug }}
                className="font-semibold text-ink underline decoration-line underline-offset-4 hover:decoration-brand"
              >
                View live version
              </Link>
            </p>
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
              publishConflict={publishConflict}
              publicationOutcome={publicationOutcome}
              onReviewLatestDraft={reviewLatestDraft}
              onDiscardChanges={() => handleDiscardDialogOpenChange(true)}
              discardButtonRef={discardButtonRef}
              onStopEditing={discardFlow.discard}
              stopping={discardFlow.discarding}
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
          title={discardFlow.conflict ? "Draft changed" : "Discard changes?"}
          description={
            discardFlow.conflict
              ? "Review the latest version before deciding whether to discard it."
              : `Unpublished changes will be lost. ${currentSubmission.system.name} will remain published, and agent access will end.`
          }
          actionLabel={discardFlow.conflict ? "Review latest draft" : "Discard changes"}
          actionPendingLabel={discardFlow.reviewing ? "Reviewing draft..." : "Discarding draft..."}
          actionVariant={discardFlow.conflict ? "primary" : "destructive"}
          pending={discardFlow.discarding || discardFlow.reviewing}
          finalFocus={discardButtonRef}
          onAction={discardFlow.conflict ? handleReviewLatestDraftAction : handleDiscardAction}
        />
      )}
    </AppShell>
  );
}
