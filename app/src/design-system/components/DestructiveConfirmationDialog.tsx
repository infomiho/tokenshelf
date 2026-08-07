import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useEffect, useRef, type RefObject } from "react";
import { Button, buttonClassName } from "./Button";
import { dialogSurfaceClassName } from "./DialogSurface";
import { typographyClassName } from "./Typography";

export type DestructiveConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  pending?: boolean;
  error?: string | null;
  finalFocus?: RefObject<HTMLElement | null>;
  onConfirm: () => boolean | Promise<boolean>;
};

export function DestructiveConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  pending = false,
  error,
  finalFocus,
  onConfirm,
}: DestructiveConfirmationDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open && pending) cancelRef.current?.focus();
  }, [open, pending]);

  function handleOpenChange(nextOpen: boolean, details: AlertDialog.Root.ChangeEventDetails) {
    if (pending && !nextOpen) {
      details.cancel();
      return;
    }
    onOpenChange(nextOpen);
  }

  async function handleConfirm() {
    if (await onConfirm()) onOpenChange(false);
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={handleOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className={dialogSurfaceClassName("backdrop")} />
        <AlertDialog.Viewport className={dialogSurfaceClassName("viewport")}>
          <AlertDialog.Popup
            className={dialogSurfaceClassName("popup", "max-w-md")}
            initialFocus={cancelRef}
            finalFocus={finalFocus}
          >
            <AlertDialog.Title className={typographyClassName("cardTitle", "text-2xl")}>
              {title}
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-3 text-sm leading-6 text-muted">
              {description}
            </AlertDialog.Description>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <AlertDialog.Close
                ref={cancelRef}
                className={buttonClassName("secondary", "aria-disabled:opacity-45")}
                aria-disabled={pending}
              >
                Cancel
              </AlertDialog.Close>
              <Button
                variant="destructive"
                disabled={pending}
                aria-busy={pending}
                onClick={() => void handleConfirm()}
              >
                {confirmLabel}
              </Button>
            </div>
            {error && (
              <p className="mt-3 text-sm text-negative" role="alert">
                {error}
              </p>
            )}
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
