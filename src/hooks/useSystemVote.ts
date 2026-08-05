import { useState } from "react";
import {
  getSystem,
  getViewerVotes,
  setVote,
  useAction,
  type OptimisticUpdateDefinition,
} from "wasp/client/operations";
import type { DesignSystem } from "../data/catalog";

type VoteInput = { systemId: string; voted: boolean };
type CachedSystem = DesignSystem & { databaseId: string; voted: boolean; publishedAt: Date };
type UseSystemVoteOptions = {
  system: DesignSystem;
  systemQueryId: string;
  isSignedIn: boolean;
  onSignInRequired: () => void;
};

function updateCachedSystem({ voted }: VoteInput, current: CachedSystem | undefined) {
  if (!current) return current;
  const voteDelta = voted ? 1 : -1;
  return { ...current, voted, votes: Math.max(0, current.votes + voteDelta) };
}

function updateCachedViewerVotes(
  { voted }: VoteInput,
  current: string[] | undefined,
  databaseId: string,
) {
  if (!current) return current;
  if (!voted) return current.filter((id) => id !== databaseId);
  return [...new Set([...current, databaseId])];
}

export function useSystemVote({
  system,
  systemQueryId,
  isSignedIn,
  onSignInRequired,
}: UseSystemVoteOptions) {
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const databaseId = system.databaseId ?? system.id;
  const setVoteOptimistically = useAction(setVote, {
    optimisticUpdates: [
      {
        getQuerySpecifier: ({ systemId }) => [getSystem, { systemId }],
        updateQuery: updateCachedSystem,
      } as OptimisticUpdateDefinition<VoteInput, CachedSystem>,
      {
        getQuerySpecifier: () => [getViewerVotes],
        updateQuery: (input, current) => updateCachedViewerVotes(input, current, databaseId),
      } as OptimisticUpdateDefinition<VoteInput, string[]>,
    ],
  });

  async function vote(nextVoted: boolean) {
    if (!isSignedIn) {
      onSignInRequired();
      return;
    }
    if (voting) return;
    setVoting(true);
    setVoteError(null);
    try {
      await setVoteOptimistically({ systemId: systemQueryId, voted: nextVoted });
    } catch {
      setVoteError("Vote not saved. The latest total has been loaded.");
    } finally {
      setVoting(false);
    }
  }

  return { vote, voting, voteError };
}
