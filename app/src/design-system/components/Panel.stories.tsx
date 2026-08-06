import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";
import { Panel } from "./Panel";
import { StatusBadge } from "./StatusBadge";

const meta = {
  title: "Components/Panel",
  component: Panel,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[min(36rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ContentCard: Story = {
  render: () => (
    <Panel className="p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="eyebrow m-0">Daily pick</p>
        <StatusBadge tone="brand">Featured</StatusBadge>
      </div>
      <h2 className="card-title text-xl">Editorial contrast</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        High-impact typography paired with restrained color and precise spacing.
      </p>
      <Button className="mt-6">View system</Button>
    </Panel>
  ),
};

export const SurfaceMatrix: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2">
      <Panel className="p-5">
        <strong>Default surface</strong>
        <p className="mt-2 text-sm text-muted">Bordered white surface.</p>
      </Panel>
      <Panel tone="subtle" className="p-5">
        <strong>Subtle surface</strong>
        <p className="mt-2 text-sm text-muted">Grouped secondary content.</p>
      </Panel>
      <Panel tone="feature" className="p-5">
        <strong>Feature surface</strong>
        <p className="mt-2 text-sm text-on-feature-muted">High-contrast editorial feature.</p>
      </Panel>
      <Panel elevation="raised" className="p-5">
        <strong>Raised surface</strong>
        <p className="mt-2 text-sm text-muted">A small amount of depth.</p>
      </Panel>
    </div>
  ),
};
