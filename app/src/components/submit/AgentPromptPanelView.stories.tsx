import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { AgentPromptPanelView } from "./AgentPromptPanelView";

const sessionUrl = "https://tokenshelf.example/api/agent/session/capability-example-token";

const meta = {
  title: "Product/Submit/AgentPromptPanelView",
  component: AgentPromptPanelView,
  args: {
    agentSessionUrl: sessionUrl,
    capabilityStatus: "active",
    editingPublishedSystem: false,
    copied: false,
    open: true,
    onCopy: fn(),
    onOpenChange: fn(),
    onRotateCapability: fn(),
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AgentPromptPanelView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {};

export const EditingPublishedSystem: Story = {
  args: { editingPublishedSystem: true },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Copy update prompt" }));
    await expect(args.onCopy).toHaveBeenCalledWith(
      `We are updating a design system we submitted to Tokenshelf.

To learn how to fetch the current version and how to submit updates, open this temporary Tokenshelf access link with an HTTP or web-fetch tool:
${sessionUrl}

Ask me what I want to update, make those changes, and submit them.`,
    );
  },
};

export const Expired: Story = {
  args: {
    capabilityStatus: "expired",
  },
};
