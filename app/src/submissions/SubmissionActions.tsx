import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { useRef, useState } from "react";
import {
  ActionMenu,
  ActionMenuItem,
  ActionMenuSeparator,
  ConfirmationDialog,
} from "../design-system/components";
type SubmissionActionsProps = {
  name: string;
  className?: string;
  state: SubmissionActionState;
  editingPublishedSystem?: boolean;
  onEdit: () => Promise<boolean>;
  onDelete: () => Promise<boolean>;
};

export type SubmissionActionState = "idle" | "editing" | "deleting" | "disabled";

export function SubmissionActions({
  name,
  className = "",
  state,
  editingPublishedSystem = false,
  onEdit,
  onDelete,
}: SubmissionActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const editing = state === "editing";
  const deleting = state === "deleting";
  const disabled = state !== "idle";

  async function handleDeleteAction() {
    await onDelete();
    return true;
  }

  return (
    <div className={className}>
      <ActionMenu
        label={`Actions for ${name}`}
        triggerRef={triggerRef}
        disabled={disabled && !editing}
        busy={editing}
        busyLabel={`Opening ${name}`}
      >
        <ActionMenuItem disabled={disabled} onClick={() => void onEdit()}>
          <PencilSimpleIcon className="size-4" aria-hidden="true" />
          {editingPublishedSystem ? "Continue editing" : "Edit"}
        </ActionMenuItem>
        {editingPublishedSystem && <ActionMenuSeparator />}
        <ActionMenuItem
          tone="destructive"
          disabled={disabled}
          onClick={() => setDeleteDialogOpen(true)}
        >
          <TrashIcon className="size-4" aria-hidden="true" />
          Delete
        </ActionMenuItem>
      </ActionMenu>
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={`Delete ${name}?`}
        description={
          editingPublishedSystem
            ? "This removes the published system and its draft from Tokenshelf. This cannot be undone."
            : "This removes it from Tokenshelf and cannot be undone."
        }
        actionLabel="Delete"
        actionVariant="destructive"
        pending={deleting}
        finalFocus={triggerRef}
        onAction={handleDeleteAction}
      />
    </div>
  );
}
