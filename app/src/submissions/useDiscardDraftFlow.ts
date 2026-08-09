import { useRef, useState } from "react";

export type DiscardDraftResult = "discarded" | "conflict" | "error";

type DiscardDraftFlowOptions = {
  onDiscard: () => Promise<DiscardDraftResult>;
  onReviewLatestDraft: () => Promise<boolean>;
  onConflict?: () => void;
  onError?: () => void;
};

export function useDiscardDraftFlow({
  onDiscard,
  onReviewLatestDraft,
  onConflict,
  onError,
}: DiscardDraftFlowOptions) {
  const [discarding, setDiscarding] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reviewInFlight = useRef(false);

  function reset() {
    setConflict(false);
    setError(null);
  }

  async function discard() {
    setDiscarding(true);
    setError(null);
    try {
      const result = await onDiscard();
      if (result === "conflict") {
        setConflict(true);
        onConflict?.();
      } else if (result === "error") {
        setError("Unable to discard the draft. Try again.");
        onError?.();
      }
      return result === "discarded";
    } finally {
      setDiscarding(false);
    }
  }

  async function reviewLatestDraft() {
    if (reviewInFlight.current) return false;
    reviewInFlight.current = true;
    setReviewing(true);
    setError(null);
    try {
      const reviewed = await onReviewLatestDraft();
      if (reviewed) setConflict(false);
      else setError("Unable to load the latest draft. Check your connection and try again.");
      return reviewed;
    } finally {
      reviewInFlight.current = false;
      setReviewing(false);
    }
  }

  return { conflict, discarding, reviewing, error, discard, reset, reviewLatestDraft };
}
