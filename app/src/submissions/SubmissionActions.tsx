import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { useRef, useState } from "react";
import {
  ActionMenu,
  ActionMenuItem,
  DestructiveConfirmationDialog,
} from "../design-system/components";

type SubmissionActionsProps = {
  name: string;
  className?: string;
  state: SubmissionActionState;
  deleteError: string | null;
  onEdit: () => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  onDeleteDialogOpen: () => void;
};

export type SubmissionActionState = "idle" | "editing" | "deleting" | "disabled";

export function SubmissionActions({
  name,
  className = "",
  state,
  deleteError,
  onEdit,
  onDelete,
  onDeleteDialogOpen,
}: SubmissionActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const editing = state === "editing";
  const deleting = state === "deleting";
  const disabled = state !== "idle";

  function handleDeleteDialogOpenChange(open: boolean) {
    setDeleteDialogOpen(open);
    if (open) onDeleteDialogOpen();
  }

  return (
    <div className={className}>
      <ActionMenu
        label={`Actions for ${name}`}
        triggerRef={triggerRef}
        disabled={disabled && !editing}
        busy={editing}
      >
        <ActionMenuItem disabled={disabled} onClick={() => void onEdit()}>
          <PencilSimpleIcon className="size-4" aria-hidden="true" />
          Edit
        </ActionMenuItem>
        <ActionMenuItem
          tone="destructive"
          disabled={disabled}
          onClick={() => handleDeleteDialogOpenChange(true)}
        >
          <TrashIcon className="size-4" aria-hidden="true" />
          Delete
        </ActionMenuItem>
      </ActionMenu>
      <DestructiveConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogOpenChange}
        title={`Delete ${name}?`}
        description="This removes it from Tokenshelf and cannot be undone."
        confirmLabel="Delete design system"
        pending={deleting}
        error={deleteError}
        finalFocus={triggerRef}
        onConfirm={onDelete}
      />
    </div>
  );
}
