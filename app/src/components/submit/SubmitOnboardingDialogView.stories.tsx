import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { SubmitOnboardingDialogView } from "./SubmitOnboardingDialogView";

const meta = {
  title: "Product/Submit/SubmitOnboardingDialogView",
  component: SubmitOnboardingDialogView,
  args: {
    open: true,
    onOpenChange: fn(),
  },
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SubmitOnboardingDialogView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};
