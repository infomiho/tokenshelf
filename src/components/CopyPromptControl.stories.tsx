import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { CopyPromptControl, type CopyPromptControlProps } from "./CopyPromptControl";

const meta = {
  title: "Product/CopyPromptControl",
  component: CopyPromptControl,
  args: {
    copied: false,
    copyError: false,
    onCopy: fn(async () => {}),
  },
} satisfies Meta<typeof CopyPromptControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Copied: Story = {
  args: { copied: true },
};

export const Error: Story = {
  args: { copyError: true },
};

function InteractiveCopyPrompt(props: CopyPromptControlProps) {
  const [copied, setCopied] = useState(false);

  return (
    <CopyPromptControl
      {...props}
      copied={copied}
      onCopy={async () => {
        await props.onCopy();
        setCopied(true);
      }}
    />
  );
}

export const CopyInteraction: Story = {
  render: (args) => <InteractiveCopyPrompt {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const copyButton = canvas.getByRole("button", { name: "Copy agent prompt" });
    const initialWidth = copyButton.getBoundingClientRect().width;
    await userEvent.click(copyButton);
    await expect(args.onCopy).toHaveBeenCalledOnce();
    const copiedButton = canvas.getByRole("button", { name: "Prompt copied" });
    await expect(copiedButton).toBeInTheDocument();
    await expect(copiedButton.getBoundingClientRect().width).toBe(initialWidth);
    await expect(canvas.getByRole("status")).toHaveTextContent("Agent prompt copied");
  },
};
