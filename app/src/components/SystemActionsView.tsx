import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { HeartIcon } from "@phosphor-icons/react/dist/csr/Heart";
import type { ReactNode } from "react";
import type { DesignSystem } from "../data/catalog";
import { ActionLink, panelClassName, ToggleButton } from "../design-system/components";
import { formatCount } from "../lib/counts";

type SystemActionsViewProps = {
  system: DesignSystem;
  voting: boolean;
  voteError: string | null;
  onVoteChange: (voted: boolean) => void;
  designMdUrl: string;
  copyPromptControl: ReactNode;
};

export function SystemActionsView({
  system,
  voting,
  voteError,
  onVoteChange,
  designMdUrl,
  copyPromptControl,
}: SystemActionsViewProps) {
  const voteCountLabel = formatCount(system.votes, "like");
  const voteActionLabel = system.voted ? "Unlike" : "Like";
  const voteAriaLabel = `${voteActionLabel} ${system.name}, ${voteCountLabel}`;
  const copiesLabel = formatCount(system.copies, "copy", "copies");

  return (
    <>
      <div
        className={panelClassName({
          className:
            "mt-4 flex w-full flex-col gap-2 p-2 sm:flex-row sm:items-center sm:justify-between",
        })}
      >
        <div className="flex flex-wrap items-center gap-3 px-1">
          <ToggleButton
            variant="brand"
            disabled={voting}
            pressed={system.voted}
            onPressedChange={onVoteChange}
            aria-label={voteAriaLabel}
          >
            <HeartIcon
              className="size-4"
              weight={system.voted ? "fill" : "regular"}
              aria-hidden="true"
            />
            {system.voted ? "Liked" : "Like"}
            <span className="tabular-nums">{system.votes.toLocaleString()}</span>
          </ToggleButton>
          <span className="px-1 text-sm font-medium tabular-nums text-muted">{copiesLabel}</span>
        </div>
        <div className="order-first flex w-full flex-col gap-2 sm:order-none sm:w-auto sm:flex-row">
          <ActionLink
            href={designMdUrl}
            target="_blank"
            rel="noreferrer"
            variant="quiet"
            className="w-full shrink-0 gap-1 whitespace-nowrap px-2 underline decoration-line underline-offset-4 hover:decoration-brand sm:w-auto"
          >
            View DESIGN.md
            <ArrowSquareOutIcon className="size-4" aria-hidden="true" />
          </ActionLink>
          {copyPromptControl}
        </div>
      </div>
      {voteError && (
        <p className="mt-3 text-sm text-negative" role="alert">
          {voteError}
        </p>
      )}
    </>
  );
}
