import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { CopySimpleIcon } from "@phosphor-icons/react/dist/csr/CopySimple";
import { Button, type ButtonVariant } from "../design-system/components";

export type CopyPromptControlProps = {
  copied: boolean;
  onCopy: () => Promise<void>;
  variant?: ButtonVariant;
  className?: string;
};

type CopyPromptState = "idle" | "copied";

const copyPromptStateClassName = (active: boolean) =>
  `col-start-1 row-start-1 inline-flex items-center justify-self-center gap-2 whitespace-nowrap ${active ? "visible" : "invisible"}`;

export function CopyPromptControl({
  copied,
  onCopy,
  variant = "primary",
  className = "",
}: CopyPromptControlProps) {
  const state: CopyPromptState = copied ? "copied" : "idle";
  const statusMessage = state === "copied" ? "Agent prompt copied" : "";

  return (
    <div className={className}>
      <Button variant={variant} className="w-full" onClick={onCopy}>
        <span className="grid">
          <span className={copyPromptStateClassName(state === "idle")}>
            <CopySimpleIcon className="size-4" aria-hidden="true" />
            Copy agent prompt
          </span>
          <span className={copyPromptStateClassName(state === "copied")}>
            <CheckIcon className="size-4" aria-hidden="true" />
            Prompt copied
          </span>
        </span>
      </Button>
      <span className="sr-only" role="status">
        {statusMessage}
      </span>
    </div>
  );
}
