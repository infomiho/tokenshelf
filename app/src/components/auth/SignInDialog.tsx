import { Dialog } from "@base-ui/react/dialog";
import {
  Button,
  buttonClassName,
  dialogSurfaceClassName,
  typographyClassName,
} from "../../design-system/components";
import { GitHubMark } from "../GitHubMark";

type SignInDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignIn: () => void;
  intent?: "account" | "publish";
};

export function SignInDialog({
  open,
  onOpenChange,
  onSignIn,
  intent = "account",
}: SignInDialogProps) {
  const publishing = intent === "publish";

  function handleSignIn() {
    onSignIn();
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className={dialogSurfaceClassName("backdrop")} />
        <Dialog.Viewport className={dialogSurfaceClassName("viewport")}>
          <Dialog.Popup className={dialogSurfaceClassName("popup", "max-w-md")}>
            <Dialog.Title className={typographyClassName("cardTitle", "text-2xl")}>
              {publishing ? "Sign in to publish" : "Sign in to Tokenshelf"}
            </Dialog.Title>
            <Dialog.Description className="mt-3 text-sm leading-6 text-muted">
              {publishing
                ? "Attach this submission to your profile."
                : "Manage your design systems and publish new ones."}
            </Dialog.Description>
            <Button className="mt-6 w-full" onClick={handleSignIn}>
              <GitHubMark className="size-5" />
              Continue with GitHub
            </Button>
            <Dialog.Close className={buttonClassName("quiet", "mt-3 w-full")}>Cancel</Dialog.Close>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
