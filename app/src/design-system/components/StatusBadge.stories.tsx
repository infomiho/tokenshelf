import { CheckCircle } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { Clock } from "@phosphor-icons/react/dist/csr/Clock";
import { WarningCircle } from "@phosphor-icons/react/dist/csr/WarningCircle";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusBadge, type StatusBadgeTone } from "./StatusBadge";

const meta = {
  title: "Components/StatusBadge",
  component: StatusBadge,
  parameters: { layout: "centered" },
  args: { children: "Draft", tone: "neutral" },
  argTypes: {
    tone: { control: "select", options: ["neutral", "brand", "positive", "caution", "negative"] },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const tones: Array<[StatusBadgeTone, string]> = [
  ["neutral", "Draft"],
  ["brand", "Daily pick"],
  ["positive", "Published"],
  ["caution", "Needs review"],
  ["negative", "Rejected"],
];

export const ToneMatrix: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {tones.map(([tone, label]) => (
        <StatusBadge key={tone} tone={tone}>
          {label}
        </StatusBadge>
      ))}
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <StatusBadge tone="positive" className="gap-1.5">
        <CheckCircle weight="fill" aria-hidden="true" /> Published
      </StatusBadge>
      <StatusBadge tone="caution" className="gap-1.5">
        <Clock weight="fill" aria-hidden="true" /> Pending review
      </StatusBadge>
      <StatusBadge tone="negative" className="gap-1.5">
        <WarningCircle weight="fill" aria-hidden="true" /> Validation failed
      </StatusBadge>
    </div>
  ),
};
