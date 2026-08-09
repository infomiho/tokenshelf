import { useEffect, useState } from "react";
import { useToast } from "../../design-system/components";
import { useClipboard } from "../../hooks/useClipboard";
import { useSubmissions } from "../../submissions/SubmissionProvider";
import { AgentPromptPanelView } from "./AgentPromptPanelView";

export function AgentPromptPanel({ collapsed = false }: { collapsed?: boolean }) {
  const { copied, copy } = useClipboard();
  const { agentSessionUrl, capabilityStatus, currentSubmission, rotateCapability } =
    useSubmissions();
  const toast = useToast();
  const [open, setOpen] = useState(!collapsed);

  useEffect(() => {
    setOpen(!collapsed);
  }, [collapsed]);

  return (
    <AgentPromptPanelView
      agentSessionUrl={agentSessionUrl}
      capabilityStatus={capabilityStatus?.status ?? null}
      editingPublishedSystem={Boolean(currentSubmission?.publication?.isEditing)}
      copied={copied}
      open={open}
      onCopy={async (prompt) => {
        toast.dismiss("clipboard-error");
        if (!(await copy(prompt)))
          toast.error("Unable to copy the agent prompt. Try again.", "clipboard-error");
      }}
      onOpenChange={setOpen}
      onRotateCapability={() => {
        void rotateCapability();
      }}
    />
  );
}
