import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Notice } from "./Notice";

const meta = {
  title: "Components/Notice",
  component: Notice,
  args: { title: "Draft discarded", description: "Gridline remains published." },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-2xl p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Notice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Positive: Story = {
  args: { tone: "positive", icon: <CheckCircleIcon className="size-5 text-positive" /> },
};

export const Conflict: Story = {
  args: {
    tone: "caution",
    title: "Draft changed",
    description: "Review the latest version before trying again.",
    icon: <WarningIcon className="size-5 text-caution" />,
    role: "alert",
  },
};
