import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { AgentPromptPanelView } from "./AgentPromptPanelView";

const sessionUrl = "https://tokenshelf.example/api/agent/session/capability-example-token";

const meta = {
  title: "Product/Submit/AgentPromptPanelView",
  component: AgentPromptPanelView,
  args: {
    agentSessionUrl: sessionUrl,
    capabilityStatus: "active",
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

export const Expired: Story = {
  args: {
    capabilityStatus: "expired",
  },
};
