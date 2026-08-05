import { Heart } from "@phosphor-icons/react/dist/csr/Heart";
import { List } from "@phosphor-icons/react/dist/csr/List";
import { SquaresFour } from "@phosphor-icons/react/dist/csr/SquaresFour";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ToggleButton } from "./ToggleButton";

const meta = {
  title: "Components/ToggleButton",
  component: ToggleButton,
  parameters: { layout: "centered" },
  args: {
    children: "Favorite",
    onPressedChange: fn(),
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "brand"] },
    size: { control: "inline-radio", options: ["compact", "default", "touch"] },
  },
} satisfies Meta<typeof ToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: (
      <>
        <Heart size={16} aria-hidden="true" /> Favorite
      </>
    ),
  },
  play: async ({ args, canvasElement }) => {
    const toggle = within(canvasElement).getByRole("button", { name: "Favorite" });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(args.onPressedChange).toHaveBeenCalledWith(true, expect.anything());
  },
};

export const VariantSizeAndStateMatrix: Story = {
  render: () => (
    <div className="grid gap-5">
      {(["default", "brand"] as const).map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-3">
          {(["compact", "default", "touch"] as const).map((size) => (
            <ToggleButton key={size} variant={variant} size={size}>
              {variant} {size}
            </ToggleButton>
          ))}
          <ToggleButton variant={variant} defaultPressed>
            Pressed
          </ToggleButton>
          <ToggleButton variant={variant} disabled>
            Disabled
          </ToggleButton>
        </div>
      ))}
    </div>
  ),
};

export const ViewControls: Story = {
  render: () => (
    <div className="flex gap-2" role="group" aria-label="Preview layout">
      <ToggleButton defaultPressed aria-label="Grid view">
        <SquaresFour size={18} aria-hidden="true" />
      </ToggleButton>
      <ToggleButton aria-label="List view">
        <List size={18} aria-hidden="true" />
      </ToggleButton>
    </div>
  ),
};

export const KeyboardToggle: Story = {
  args: { children: "Show metadata" },
  play: async ({ args, canvasElement }) => {
    const toggle = within(canvasElement).getByRole("button", { name: "Show metadata" });
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(args.onPressedChange).toHaveBeenCalledOnce();
  },
};
