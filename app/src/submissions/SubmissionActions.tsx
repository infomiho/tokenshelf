import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { useRef, useState } from "react";
import {
  ActionMenu,
  ActionMenuItem,
  ActionMenuSeparator,
  ConfirmationDialog,
} from "../design-system/components";
import { useDiscardDraftFlow, type DiscardDraftResult } from "./useDiscardDraftFlow";

type SubmissionActionsProps = {
  name: string;
  className?: string;
  state: SubmissionActionState;
  editingPublishedSystem?: boolean;
  hasDraftChanges?: boolean;
  deleteError: string | null;
  onEdit: () => Promise<boolean>;
  onDiscard: () => Promise<DiscardDraftResult>;
  onReviewLatestDraft: () => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  onDeleteDialogOpen: () => void;
};

export type SubmissionActionState = "idle" | "editing" | "discarding" | "deleting" | "disabled";

export function SubmissionActions({
  name,
  className = "",
  state,
  editingPublishedSystem = false,
  hasDraftChanges = false,
  deleteError,
  onEdit,
  onDiscard,
  onReviewLatestDraft,
  onDelete,
  onDeleteDialogOpen,
}: SubmissionActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const editing = state === "editing";
  const discarding = state === "discarding";
  const deleting = state === "deleting";
  const disabled = state !== "idle";
  const discardFlow = useDiscardDraftFlow({
    onDiscard,
    onReviewLatestDraft,
    onConflict: () => setDiscardDialogOpen(true),
    onError: () => setDiscardDialogOpen(true),
  });

  function handleDeleteDialogOpenChange(open: boolean) {
    setDeleteDialogOpen(open);
    if (open) onDeleteDialogOpen();
  }

  function handleDiscardDialogOpenChange(open: boolean) {
    setDiscardDialogOpen(open);
    if (open) discardFlow.reset();
  }

  return (
    <div className={className}>
      <ActionMenu
        label={`Actions for ${name}`}
        triggerRef={triggerRef}
        disabled={disabled && !editing}
        busy={editing}
      >
        {editingPublishedSystem && hasDraftChanges ? (
          <ActionMenuItem
            tone="destructive"
            disabled={disabled}
            onClick={() => handleDiscardDialogOpenChange(true)}
          >
            <TrashIcon className="size-4" aria-hidden="true" />
            Discard draft changes
          </ActionMenuItem>
        ) : editingPublishedSystem ? (
          <ActionMenuItem disabled={disabled} onClick={() => void discardFlow.discard()}>
            <XIcon className="size-4" aria-hidden="true" />
            Stop editing
          </ActionMenuItem>
        ) : (
          <ActionMenuItem disabled={disabled} onClick={() => void onEdit()}>
            <PencilSimpleIcon className="size-4" aria-hidden="true" />
            Edit
          </ActionMenuItem>
        )}
        {editingPublishedSystem && <ActionMenuSeparator />}
        <ActionMenuItem
          tone="destructive"
          disabled={disabled}
          onClick={() => handleDeleteDialogOpenChange(true)}
        >
          <TrashIcon className="size-4" aria-hidden="true" />
          Delete design system
        </ActionMenuItem>
      </ActionMenu>
      <ConfirmationDialog
        open={discardDialogOpen}
        onOpenChange={handleDiscardDialogOpenChange}
        title={
          discardFlow.conflict
            ? "Draft changed"
            : hasDraftChanges
              ? "Discard draft changes?"
              : "Unable to stop editing"
        }
        description={
          discardFlow.conflict
            ? "Review the latest version before deciding whether to discard it."
            : hasDraftChanges
              ? `Unpublished changes will be lost. ${name} will remain published, and agent access will end.`
              : `${name} remains published. Try stopping the editing session again.`
        }
        actionLabel={
          discardFlow.conflict
            ? "Review latest draft"
            : hasDraftChanges
              ? "Discard draft changes"
              : "Try again"
        }
        actionPendingLabel={
          discardFlow.reviewing
            ? "Reviewing draft..."
            : hasDraftChanges
              ? "Discarding draft..."
              : "Stopping..."
        }
        actionVariant={discardFlow.conflict || !hasDraftChanges ? "primary" : "destructive"}
        pending={discarding || discardFlow.discarding || discardFlow.reviewing}
        error={discardFlow.error}
        finalFocus={triggerRef}
        onAction={discardFlow.conflict ? discardFlow.reviewLatestDraft : discardFlow.discard}
      />
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogOpenChange}
        title={`Delete ${name}?`}
        description={
          editingPublishedSystem
            ? "This removes the published system and its draft from Tokenshelf. This cannot be undone."
            : "This removes it from Tokenshelf and cannot be undone."
        }
        actionLabel="Delete design system"
        actionVariant="destructive"
        pending={deleting}
        error={deleteError}
        finalFocus={triggerRef}
        onAction={onDelete}
      />
    </div>
  );
}
