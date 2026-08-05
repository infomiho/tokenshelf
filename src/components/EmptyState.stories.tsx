import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../design-system/components";
import { EmptyState } from "./EmptyState";

const meta = {
  title: "Product/EmptyState",
  component: EmptyState,
  parameters: { layout: "padded" },
  args: {
    title: "No systems yet",
    description: "Submit a design system to start building your public shelf.",
    action: <Button variant="onDark">Submit a system</Button>,
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutAction: Story = {
  args: {
    title: "Nothing matches these filters",
    description: "Try another combination of tags and vibes.",
    action: undefined,
  },
};
