import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ComponentProps } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { Button } from "./Button";
import { ConfirmationDialog } from "./ConfirmationDialog";

const meta = {
  title: "Components/ConfirmationDialog",
  component: ConfirmationDialog,
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    onOpenChange: fn(),
    title: "Draft changed",
    description: "Review the latest version before trying again.",
    actionLabel: "Review latest draft",
    onAction: fn(async () => true),
  },
} satisfies Meta<typeof ConfirmationDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Recovery: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await expect(page.getByRole("alertdialog", { name: "Draft changed" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel" })).toHaveFocus();
  },
};

export const Pending: Story = {
  args: { pending: true, actionPendingLabel: "Reviewing draft..." },
};

function DialogInteraction(args: ComponentProps<typeof ConfirmationDialog>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open confirmation</Button>
      <ConfirmationDialog
        {...args}
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          args.onOpenChange(nextOpen);
        }}
      />
    </>
  );
}

export const Interaction: Story = {
  args: { open: false },
  render: (args) => <DialogInteraction {...args} />,
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Open confirmation" }));
    await waitFor(() => expect(page.getByRole("button", { name: "Cancel" })).toHaveFocus());
    await userEvent.click(page.getByRole("button", { name: "Review latest draft" }));
    await expect(args.onAction).toHaveBeenCalledOnce();
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};
