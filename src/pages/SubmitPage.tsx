import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { LoadingPage } from "../components/LoadingPage";
import { SignInDialog } from "../components/auth/SignInDialog";
import { SubmitOnboardingDialog } from "../components/submit/SubmitOnboardingDialog";
import { SubmissionPreview, SubmissionSidebar } from "../components/submit/SubmissionWorkspace";
import { PageContainer, typographyClassName } from "../design-system/components";
import { SubmissionProvider, useSubmissions } from "../submissions/SubmissionProvider";

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
    publishError,
  } = useSubmissions();
  const [signInOpen, setSignInOpen] = useState(false);

  function handlePublish() {
    if (user) void publish();
    else setSignInOpen(true);
  }

  if (loading) return <LoadingPage label="Loading submission" />;

  return (
    <AppShell>
      <PageContainer className="pb-24 pt-5">
        <header>
          <h1 className={typographyClassName("cardTitle", "text-2xl")}>
            {currentSubmission ? currentSubmission.system.name : "New submission"}
          </h1>
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
          <aside className="min-w-0 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1">
            <SubmissionSidebar
              submission={currentSubmission}
              stage={stage}
              onPublish={handlePublish}
              publishing={publishing}
              publishError={publishError}
            />
          </aside>
          <SubmissionPreview submission={currentSubmission} />
        </div>
      </PageContainer>
      <SubmitOnboardingDialog />
      <SignInDialog
        open={signInOpen}
        onOpenChange={setSignInOpen}
        intent="publish"
        onSignIn={signInToPublish}
      />
    </AppShell>
  );
}
