import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoadingIndicator } from "./LoadingIndicator";

const meta = {
  title: "Components/LoadingIndicator",
  component: LoadingIndicator,
  args: { label: "Loading systems" },
  parameters: { layout: "centered" },
} satisfies Meta<typeof LoadingIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: { size: "compact" },
};
