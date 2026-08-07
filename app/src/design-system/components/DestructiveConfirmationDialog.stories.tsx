import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ComponentProps } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { Button } from "./Button";
import { DestructiveConfirmationDialog } from "./DestructiveConfirmationDialog";

const meta = {
  title: "Components/DestructiveConfirmationDialog",
  component: DestructiveConfirmationDialog,
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    onOpenChange: fn(),
    title: "Delete Gridline?",
    description: "This removes it from Tokenshelf and cannot be undone.",
    confirmLabel: "Delete design system",
    onConfirm: fn(async () => true),
  },
} satisfies Meta<typeof DestructiveConfirmationDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await expect(page.getByRole("alertdialog", { name: "Delete Gridline?" })).toBeVisible();
  },
};

function DialogInteraction(args: ComponentProps<typeof DestructiveConfirmationDialog>) {
  const [open, setOpen] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    args.onOpenChange(nextOpen);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open deletion confirmation</Button>
      <DestructiveConfirmationDialog {...args} open={open} onOpenChange={handleOpenChange} />
    </>
  );
}

export const Interaction: Story = {
  args: { open: false },
  render: (args) => <DialogInteraction {...args} />,
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Open deletion confirmation" }));
    const cancel = page.getByRole("button", { name: "Cancel" });
    await waitFor(() => expect(cancel).toHaveFocus());
    await userEvent.click(page.getByRole("button", { name: "Delete design system" }));
    await expect(args.onConfirm).toHaveBeenCalledOnce();
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};

function PendingInteraction(args: ComponentProps<typeof DestructiveConfirmationDialog>) {
  const [pending, setPending] = useState(false);

  return (
    <DestructiveConfirmationDialog
      {...args}
      pending={pending}
      onConfirm={() => {
        setPending(true);
        return false;
      }}
    />
  );
}

export const Pending: Story = {
  args: { pending: false },
  render: (args) => <PendingInteraction {...args} />,
  play: async ({ canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(page.getByRole("button", { name: "Delete design system" }));
    await waitFor(() => expect(page.getByRole("button", { name: "Cancel" })).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await expect(page.getByRole("alertdialog", { name: "Delete Gridline?" })).toBeVisible();
  },
};

export const Error: Story = {
  args: { error: "Unable to delete this design system. Try again." },
};
