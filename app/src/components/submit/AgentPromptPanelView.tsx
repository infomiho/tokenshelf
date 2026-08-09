import { maskAgentAccessUrl } from "@infomiho/agent-work-protocol";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { CopySimpleIcon } from "@phosphor-icons/react/dist/csr/CopySimple";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import {
  Button,
  Panel,
  controlSizeClassName,
  typographyClassName,
} from "../../design-system/components";

const buildAgentPrompt = (sessionUrl: string, editingPublishedSystem: boolean) =>
  editingPublishedSystem
    ? `We are updating a design system we submitted to Tokenshelf.

To learn how to fetch the current version and how to submit updates, open this temporary Tokenshelf access link with an HTTP or web-fetch tool:
${sessionUrl}

Ask me what I want to update, make those changes, and submit them.`
    : `We are submitting a design system to Tokenshelf.

To learn how to submit it, open this temporary Tokenshelf access link with an HTTP or web-fetch tool:
${sessionUrl}

Ask me for source material: an app, website, Figma file, screenshots, design tokens, or design documentation. Create the design system from that source and submit it.`;

type AgentPromptPanelViewProps = {
  agentSessionUrl: string | null;
  capabilityStatus: "active" | "expired" | "revoked" | null;
  editingPublishedSystem: boolean;
  copied: boolean;
  open: boolean;
  onCopy: (prompt: string) => void;
  onOpenChange: (open: boolean) => void;
  onRotateCapability: () => void;
};

export function AgentPromptPanelView({
  agentSessionUrl,
  capabilityStatus,
  editingPublishedSystem,
  copied,
  open,
  onCopy,
  onOpenChange,
  onRotateCapability,
}: AgentPromptPanelViewProps) {
  const agentPrompt = agentSessionUrl
    ? buildAgentPrompt(agentSessionUrl, editingPublishedSystem)
    : "Rotate the agent capability to create a new temporary prompt.";
  const maskedSessionUrl = agentSessionUrl
    ? maskAgentAccessUrl(agentSessionUrl)
    : "Temporary session link hidden";
  const hasActiveAccess = Boolean(agentSessionUrl && capabilityStatus === "active");

  return (
    <Panel tone="feature" className="self-start p-4 sm:p-5">
      <details
        open={open}
        onToggle={(event) => onOpenChange(event.currentTarget.open)}
        className="group/prompt"
      >
        <summary
          className={`flex ${controlSizeClassName("default")} list-none items-center justify-between gap-4 marker:content-none`}
        >
          <h2 className={typographyClassName("cardTitle", "text-lg text-paper")}>
            {editingPublishedSystem ? "Update with your agent" : "Agent prompt"}
          </h2>
          <CaretDownIcon
            aria-hidden="true"
            className="size-4 shrink-0 transition-transform group-open/prompt:rotate-180"
          />
        </summary>
        <div className="mt-4">
          <div className="rounded-[var(--radius-technical)] border border-feature-line bg-white/[0.03] p-4">
            <div className="space-y-4 font-mono text-sm leading-6">
              <p>
                {editingPublishedSystem
                  ? "We are updating a design system we submitted to Tokenshelf."
                  : "We are submitting a design system to Tokenshelf."}
              </p>
              <div>
                <p>
                  {editingPublishedSystem
                    ? "Open this temporary Tokenshelf access link to learn how to fetch the current version and submit updates:"
                    : "Open this temporary Tokenshelf access link to learn how to submit it:"}
                </p>
                <details className="group/access relative mt-2 min-w-0">
                  <summary
                    className={`flex ${controlSizeClassName("default")} list-none items-center gap-2 text-on-feature marker:content-none hover:text-paper`}
                  >
                    <code className="min-w-0 truncate underline decoration-brand decoration-dotted underline-offset-4">
                      {maskedSessionUrl}
                    </code>
                    <InfoIcon className="size-4 shrink-0 text-brand" aria-hidden="true" />
                  </summary>
                  <div className="mt-2 border-s border-feature-line ps-3 font-sans">
                    <strong className="block text-sm text-paper">Temporary agent access</strong>
                    <p className="mt-1 text-sm leading-6 text-on-feature-muted">
                      This authenticated URL lets your agent read the submission instructions and
                      send draft updates. It expires in 24 hours and cannot publish.
                    </p>
                  </div>
                </details>
              </div>
              <p>
                {editingPublishedSystem
                  ? "Ask me what I want to update, make those changes, and submit them."
                  : "Ask me for source material, create the design system, and submit it."}
              </p>
            </div>
          </div>
          {hasActiveAccess ? (
            <Button variant="onDark" className="mt-4 w-full" onClick={() => onCopy(agentPrompt)}>
              {copied ? (
                <CheckIcon className="size-4" aria-hidden="true" />
              ) : (
                <CopySimpleIcon className="size-4" aria-hidden="true" />
              )}
              {copied
                ? "Prompt copied"
                : editingPublishedSystem
                  ? "Copy update prompt"
                  : "Copy prompt"}
            </Button>
          ) : (
            <Button variant="onDark" className="mt-4 w-full" onClick={onRotateCapability}>
              {agentSessionUrl ? "Create replacement access" : "Create agent access"}
            </Button>
          )}
        </div>
      </details>
    </Panel>
  );
}
