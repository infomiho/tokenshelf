import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: { layout: "centered" },
  args: {
    label: "Include source tokens",
    onCheckedChange: fn(),
  },
  argTypes: {
    size: { control: "inline-radio", options: ["compact", "default", "touch"] },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { description: "Adds the canonical JSON document to the export." },
  play: async ({ args, canvasElement }) => {
    const checkbox = within(canvasElement).getByRole("checkbox", {
      name: "Include source tokens",
    });
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledOnce();
  },
};

export const SizesAndStates: Story = {
  render: () => (
    <div className="grid gap-3">
      <Checkbox label="Compact unchecked" size="compact" />
      <Checkbox label="Default checked" defaultChecked />
      <Checkbox
        label="Touch target"
        size="touch"
        description="A larger row for touch interfaces."
      />
      <Checkbox label="Mixed selection" indeterminate />
      <Checkbox label="Disabled option" disabled />
      <Checkbox label="Disabled checked option" disabled defaultChecked />
    </div>
  ),
};

export const KeyboardToggle: Story = {
  args: { label: "Notify me when published" },
  play: async ({ args, canvasElement }) => {
    const checkbox = within(canvasElement).getByRole("checkbox", {
      name: "Notify me when published",
    });
    await userEvent.tab();
    await expect(checkbox).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(checkbox).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledOnce();
  },
};

export const Indeterminate: Story = {
  args: { label: "Some systems selected", indeterminate: true },
  play: async ({ canvasElement }) => {
    const checkbox = within(canvasElement).getByRole("checkbox", {
      name: "Some systems selected",
    });
    await expect(checkbox).toHaveAttribute("aria-checked", "mixed");
  },
};
