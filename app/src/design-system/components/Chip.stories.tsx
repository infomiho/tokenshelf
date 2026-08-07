import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { Chip } from "./Chip";

const meta = {
  title: "Components/Chip",
  component: Chip,
  parameters: { layout: "centered" },
  args: {
    children: "Editorial",
    value: "editorial",
    onPressedChange: fn(),
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const chip = canvas.getByRole("button", { name: "Editorial" });
    await userEvent.click(chip);
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    await expect(args.onPressedChange).toHaveBeenCalledOnce();
  },
};

export const FilterStates: Story = {
  render: () => (
    <div className="flex max-w-xl flex-wrap gap-2" role="group" aria-label="Style filters">
      <Chip value="all" defaultPressed>
        All systems
      </Chip>
      <Chip value="editorial">Editorial</Chip>
      <Chip value="technical">Technical</Chip>
      <Chip value="playful">Playful</Chip>
      <Chip value="unavailable" disabled>
        Unavailable
      </Chip>
    </div>
  ),
};

export const KeyboardToggle: Story = {
  args: { children: "High contrast", value: "high-contrast" },
  play: async ({ args, canvas, userEvent }) => {
    const chip = canvas.getByRole("button", { name: "High contrast" });
    await userEvent.tab();
    await expect(chip).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    await expect(args.onPressedChange).toHaveBeenCalledOnce();
  },
};
