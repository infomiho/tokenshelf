import { useState } from "react";
import { config } from "wasp/client";
import { useCurrentUser } from "../auth/useCurrentUser";
import type { DesignSystem } from "../data/catalog";
import { useSystemVote } from "../hooks/useSystemVote";
import { SignInDialog } from "./auth/SignInDialog";
import { CopyPromptButton } from "./CopyPromptButton";
import { SystemActionsView } from "./SystemActionsView";

type SystemActionsProps = {
  system: DesignSystem;
  slug: string;
};

export function SystemActions({ system, slug }: SystemActionsProps) {
  const [signInOpen, setSignInOpen] = useState(false);
  const { user, signIn } = useCurrentUser();
  const isSignedIn = Boolean(user);
  const { vote, voting } = useSystemVote({
    system,
    slug,
    isSignedIn,
    onSignInRequired: openSignIn,
  });
  const designMdUrl = `${config.apiUrl.replace(/\/$/, "")}/v1/systems/${encodeURIComponent(system.id)}/DESIGN.md`;

  function openSignIn() {
    setSignInOpen(true);
  }

  function handleVoteChange(nextVoted: boolean) {
    void vote(nextVoted);
  }

  return (
    <>
      <SystemActionsView
        system={system}
        voting={voting}
        onVoteChange={handleVoteChange}
        designMdUrl={designMdUrl}
        copyPromptControl={
          <CopyPromptButton system={system} className="min-w-0 flex-1 sm:flex-none" />
        }
      />
      <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} onSignIn={signIn} />
    </>
  );
}
