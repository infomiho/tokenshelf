import { Dialog } from "@base-ui/react/dialog";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import {
  buttonClassName,
  dialogSurfaceClassName,
  typographyClassName,
} from "../../design-system/components";
import { AgentMarks } from "../AgentMarks";
import { DesignSourcesVisual } from "../DesignSourcesVisual";
import { LogoMark } from "../../design-system/components";

const steps = [
  {
    title: "Give the prompt to your agent",
    detail: "Copy the prompt from this page into your coding agent.",
  },
  {
    title: "Point it to the design",
    detail: "Tell it to inspect your app, use Figma through MCP, or work from tokens you describe.",
  },
  {
    title: "Review and publish",
    detail:
      "Your agent submits your design tokens and Tokenshelf validates them. You can then share it with others.",
  },
];

type SubmitOnboardingDialogViewProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SubmitOnboardingDialogView({
  open,
  onOpenChange,
}: SubmitOnboardingDialogViewProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className={dialogSurfaceClassName("backdrop")} />
        <Dialog.Viewport className={dialogSurfaceClassName("viewport")}>
          <Dialog.Popup className={dialogSurfaceClassName("popup", "max-w-[37.5rem] p-5 sm:p-6")}>
            <Dialog.Title className={typographyClassName("cardTitle", "text-3xl")}>
              How to submit a design system
            </Dialog.Title>

            <ol className="mt-8 grid gap-5">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-3 sm:gap-4"
                >
                  <span className="grid min-h-16 place-items-center" aria-hidden="true">
                    {index === 0 ? (
                      <AgentMarks className="relative block h-16 w-[5.25rem]" />
                    ) : index === 1 ? (
                      <DesignSourcesVisual />
                    ) : (
                      <span className="relative">
                        <LogoMark className="size-12 text-brand" />
                        <span className="absolute -bottom-1 -right-2 grid size-6 place-items-center rounded-full bg-positive text-white ring-[3px] ring-surface">
                          <CheckIcon className="size-4" weight="bold" />
                        </span>
                      </span>
                    )}
                  </span>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>

            <Dialog.Close className={buttonClassName("primary", "mt-7")}>
              Start a submission
            </Dialog.Close>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
