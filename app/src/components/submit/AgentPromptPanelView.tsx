import { maskAgentAccessUrl } from "@infomiho/agent-work-protocol";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { CopySimpleIcon } from "@phosphor-icons/react/dist/csr/CopySimple";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import {
  Button,
  Panel,
  Popover,
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
                <div
                  className={`mt-2 flex ${controlSizeClassName("default")} min-w-0 items-center gap-2`}
                >
                  {agentSessionUrl ? (
                    <a
                      href={agentSessionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block min-w-0 text-on-feature hover:text-paper"
                    >
                      <code className="block truncate underline decoration-brand decoration-dotted underline-offset-4">
                        {maskedSessionUrl}
                      </code>
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <code className="block min-w-0 truncate text-on-feature-muted">
                      {maskedSessionUrl}
                    </code>
                  )}
                  <Popover
                    title="What's in the link?"
                    side="right"
                    align="center"
                    trigger={
                      <button
                        type="button"
                        aria-label="About temporary agent access"
                        className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-brand hover:bg-on-feature/8 hover:text-paper"
                      >
                        <InfoIcon className="size-4" aria-hidden="true" />
                      </button>
                    }
                  >
                    <ul className="list-disc space-y-1 ps-4">
                      <li>Markdown docs on how to submit a design system to Tokenshelf.</li>
                      <li>
                        Your agent uses the temporary link to submit its work. It expires after 24
                        hours.
                      </li>
                      <li>Nothing needs to be installed or run on your computer.</li>
                    </ul>
                  </Popover>
                </div>
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
