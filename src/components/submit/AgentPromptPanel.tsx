import { useEffect, useState } from "react";
import { useClipboard } from "../../hooks/useClipboard";
import { useSubmissions } from "../../submissions/SubmissionProvider";
import { AgentPromptPanelView } from "./AgentPromptPanelView";

export function AgentPromptPanel({ collapsed = false }: { collapsed?: boolean }) {
  const { copied, copy } = useClipboard();
  const { agentSessionUrl, capabilityStatus, rotateCapability } = useSubmissions();
  const [open, setOpen] = useState(!collapsed);

  useEffect(() => {
    setOpen(!collapsed);
  }, [collapsed]);

  return (
    <AgentPromptPanelView
      agentSessionUrl={agentSessionUrl}
      capabilityStatus={capabilityStatus?.status ?? null}
      copied={copied}
      open={open}
      onCopy={copy}
      onOpenChange={setOpen}
      onRotateCapability={() => {
        void rotateCapability();
      }}
    />
  );
}
