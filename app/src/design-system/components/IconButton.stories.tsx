import { Heart } from "@phosphor-icons/react/dist/csr/Heart";
import { ShareNetwork } from "@phosphor-icons/react/dist/csr/ShareNetwork";
import { Trash } from "@phosphor-icons/react/dist/csr/Trash";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { IconButton } from "./IconButton";

const meta = {
  title: "Components/IconButton",
  component: IconButton,
  parameters: { layout: "centered" },
  args: {
    label: "Add to favorites",
    children: <Heart size={18} aria-hidden="true" />,
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "quiet", "onDark", "onDarkSecondary"],
    },
    size: { control: "inline-radio", options: ["compact", "default", "touch"] },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { variant: "secondary" },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Add to favorites" });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const SizesAndStates: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton label="Share compact" size="compact" variant="secondary">
        <ShareNetwork size={16} aria-hidden="true" />
      </IconButton>
      <IconButton label="Share default" variant="secondary">
        <ShareNetwork size={18} aria-hidden="true" />
      </IconButton>
      <IconButton label="Share touch size" size="touch" variant="secondary">
        <ShareNetwork size={20} aria-hidden="true" />
      </IconButton>
      <IconButton label="Delete system" variant="quiet">
        <Trash size={18} aria-hidden="true" />
      </IconButton>
      <IconButton label="Delete unavailable" disabled>
        <Trash size={18} aria-hidden="true" />
      </IconButton>
    </div>
  ),
};

export const KeyboardActivation: Story = {
  args: { label: "Share system", children: <ShareNetwork size={18} aria-hidden="true" /> },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Share system" });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
