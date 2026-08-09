import { config } from "wasp/client";
import type { DesignSystem } from "../data/catalog";
import { buildDesignPrompt } from "../data/design-prompt";
import { useToast, type ButtonVariant } from "../design-system/components";
import { useClipboard } from "../hooks/useClipboard";
import { useRecordCopy } from "../hooks/useRecordCopy";
import { CopyPromptControl } from "./CopyPromptControl";

export function CopyPromptButton({
  system,
  variant = "primary",
  className = "",
}: {
  system: Pick<DesignSystem, "id">;
  variant?: ButtonVariant;
  className?: string;
}) {
  const { copied, copy } = useClipboard();
  const recordCopy = useRecordCopy();
  const toast = useToast();
  const designMdUrl = `${config.apiUrl.replace(/\/$/, "")}/v1/systems/${encodeURIComponent(system.id)}/DESIGN.md`;
  const prompt = buildDesignPrompt(designMdUrl);

  async function handleCopy(): Promise<void> {
    toast.dismiss("clipboard-error");
    const wasCopied = await copy(prompt);
    if (!wasCopied) {
      toast.error("Unable to copy the agent prompt. Try again.", "clipboard-error");
      return;
    }

    await recordCopy(system.id);
  }

  return (
    <CopyPromptControl
      copied={copied}
      onCopy={handleCopy}
      variant={variant}
      className={className}
    />
  );
}
