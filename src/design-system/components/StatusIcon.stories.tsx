import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusIcon } from "./StatusIcon";

const meta = {
  title: "Components/StatusIcon",
  component: StatusIcon,
  args: {
    label: "Passed",
    tone: "positive",
    children: <CheckIcon className="size-3.5" weight="bold" aria-hidden="true" />,
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof StatusIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ValidationStates: Story = {
  render: () => (
    <div className="flex gap-3">
      <StatusIcon label="Failed" tone="negative">
        <XIcon className="size-3.5" weight="bold" aria-hidden="true" />
      </StatusIcon>
      <StatusIcon label="Warning" tone="caution">
        <WarningIcon className="size-3.5" weight="bold" aria-hidden="true" />
      </StatusIcon>
      <StatusIcon label="Passed" tone="positive">
        <CheckIcon className="size-3.5" weight="bold" aria-hidden="true" />
      </StatusIcon>
    </div>
  ),
};
