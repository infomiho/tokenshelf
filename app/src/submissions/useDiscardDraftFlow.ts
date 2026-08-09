import { useRef, useState } from "react";

export type DiscardDraftResult = "discarded" | "conflict" | "error";

type DiscardDraftFlowOptions = {
  onDiscard: () => Promise<DiscardDraftResult>;
  onReviewLatestDraft: () => Promise<boolean>;
  onConflict?: () => void;
};

export function useDiscardDraftFlow({
  onDiscard,
  onReviewLatestDraft,
  onConflict,
}: DiscardDraftFlowOptions) {
  const [discarding, setDiscarding] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [conflict, setConflict] = useState(false);
  const reviewInFlight = useRef(false);

  async function discard() {
    setDiscarding(true);
    try {
      const result = await onDiscard();
      if (result === "conflict") {
        setConflict(true);
        onConflict?.();
      }
      return result;
    } finally {
      setDiscarding(false);
    }
  }

  async function reviewLatestDraft() {
    if (reviewInFlight.current) return false;
    reviewInFlight.current = true;
    setReviewing(true);
    try {
      const reviewed = await onReviewLatestDraft();
      if (reviewed) setConflict(false);
      return reviewed;
    } finally {
      reviewInFlight.current = false;
      setReviewing(false);
    }
  }

  return { conflict, discarding, reviewing, discard, reviewLatestDraft };
}
