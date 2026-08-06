import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ComponentProps } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { ColorSwatchView } from "./ColorSwatch";
import "./SystemDetails.css";

function ControlledColorSwatch({
  role,
  value,
  copied: initialCopied,
  onCopy,
}: ComponentProps<typeof ColorSwatchView>) {
  const [copied, setCopied] = useState(initialCopied);

  return (
    <ColorSwatchView
      role={role}
      value={value}
      copied={copied}
      onCopy={(copiedValue) => {
        onCopy(copiedValue);
        setCopied(true);
      }}
    />
  );
}

const meta = {
  title: "Product/ColorSwatch",
  component: ColorSwatchView,
  args: {
    role: "brand",
    value: "#ff5a36",
    copied: false,
    onCopy: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ColorSwatchView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Brand: Story = {
  render: (args) => <ControlledColorSwatch {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const swatch = canvas.getByRole("button", { name: "Copy brand color #ff5a36" });
    const initialSize = swatch.getBoundingClientRect();

    await userEvent.click(swatch);
    await expect(canvas.getByText("Copied")).toBeInTheDocument();
    await expect(args.onCopy).toHaveBeenCalledWith("#ff5a36");

    const copiedSize = swatch.getBoundingClientRect();
    await expect(copiedSize.width).toBe(initialSize.width);
    await expect(copiedSize.height).toBe(initialSize.height);
  },
};

export const Light: Story = {
  render: (args) => <ControlledColorSwatch {...args} />,
  args: {
    role: "surfaceSubtle",
    value: "#f4f1eb",
  },
};

export const Dark: Story = {
  render: (args) => <ControlledColorSwatch {...args} />,
  args: {
    role: "textStrong",
    value: "#161616",
  },
};
