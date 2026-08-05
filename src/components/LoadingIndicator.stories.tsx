import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoadingIndicator } from "./LoadingIndicator";

const meta = {
  title: "Product/Loading Indicator",
  component: LoadingIndicator,
  args: { label: "Loading systems" },
} satisfies Meta<typeof LoadingIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
