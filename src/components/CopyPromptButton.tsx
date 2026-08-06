import { config } from "wasp/client";
import type { DesignSystem } from "../data/catalog";
import { buildDesignPrompt } from "../data/design-prompt";
import type { ButtonVariant } from "../design-system/components";
import { useClipboard } from "../hooks/useClipboard";
import { useRecordCopy } from "../hooks/useRecordCopy";
import { CopyPromptControl } from "./CopyPromptControl";

export function CopyPromptButton({
  system,
  variant = "primary",
  className = "",
}: {
  system: DesignSystem;
  variant?: ButtonVariant;
  className?: string;
}) {
  const { copied, copyError, copy } = useClipboard();
  const recordCopy = useRecordCopy();
  const designMdUrl = `${config.apiUrl.replace(/\/$/, "")}/api/systems/${encodeURIComponent(system.id)}/DESIGN.md`;
  const prompt = buildDesignPrompt(designMdUrl);

  async function handleCopy(): Promise<void> {
    const wasCopied = await copy(prompt);
    if (!wasCopied) return;

    await recordCopy(system.databaseId ?? system.id);
  }

  return (
    <CopyPromptControl
      copied={copied}
      copyError={copyError}
      onCopy={handleCopy}
      variant={variant}
      className={className}
    />
  );
}
