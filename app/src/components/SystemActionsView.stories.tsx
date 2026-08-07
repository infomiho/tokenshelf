import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { catalogFixtures } from "../data/catalogFixtures";
import { CopyPromptControl } from "./CopyPromptControl";
import { SystemActionsView } from "./SystemActionsView";

const system = { ...catalogFixtures[0]!, voted: false };

const meta = {
  title: "Product/System Actions",
  component: SystemActionsView,
  args: {
    system,
    voting: false,
    voteError: null,
    onVoteChange: fn(),
    designMdUrl: "https://example.com/systems/apex-velocity/DESIGN.md",
    copyPromptControl: (
      <CopyPromptControl copied={false} copyError={false} onCopy={fn(async () => {})} />
    ),
  },
} satisfies Meta<typeof SystemActionsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Liked: Story = {
  args: {
    system: { ...system, voted: true },
  },
};

export const VoteError: Story = {
  args: {
    voteError: "Your like could not be saved. Try again.",
  },
};

export const Mobile: Story = {
  globals: {
    viewport: "mobile1",
  },
};
