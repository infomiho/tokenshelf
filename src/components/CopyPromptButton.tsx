import { config } from "wasp/client";
import { api } from "wasp/client/api";
import type { DesignSystem } from "../data/catalog";
import { buildDesignPrompt } from "../data/design-prompt";
import type { ButtonVariant } from "../design-system/components";
import { useClipboard } from "../hooks/useClipboard";
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
  const designMdUrl = `${config.apiUrl.replace(/\/$/, "")}/api/systems/${encodeURIComponent(system.id)}/DESIGN.md`;
  const prompt = buildDesignPrompt(designMdUrl);

  async function handleCopy() {
    if (!(await copy(prompt))) return;
    void api
      .post("/api/systems/copy", { json: { systemId: system.databaseId ?? system.id } })
      .catch(() => {});
  }

  return (
    <CopyPromptControl
      copied={copied}
      copyError={copyError}
      onCopy={() => void handleCopy()}
      variant={variant}
      className={className}
    />
  );
}
