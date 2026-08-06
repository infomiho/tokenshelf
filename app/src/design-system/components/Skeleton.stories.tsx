import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./Skeleton";

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextAndControl: Story = {
  render: () => (
    <div className="w-80 rounded-[var(--radius-card)] border border-line bg-surface p-5">
      <Skeleton className="h-6 w-2/3 rounded-sm" />
      <Skeleton className="mt-4 h-3 w-full rounded-sm" />
      <Skeleton className="mt-2 h-3 w-4/5 rounded-sm" />
      <Skeleton className="mt-6 h-11 w-32 rounded-[var(--radius-control)]" />
    </div>
  ),
};

export const OnFeature: Story = {
  render: () => (
    <div className="w-80 rounded-[var(--radius-card)] bg-feature p-5">
      <Skeleton tone="feature" className="h-6 w-2/3 rounded-sm" />
      <Skeleton tone="feature" className="mt-4 h-3 w-full rounded-sm" />
      <Skeleton tone="feature" className="mt-2 h-3 w-4/5 rounded-sm" />
    </div>
  ),
};
