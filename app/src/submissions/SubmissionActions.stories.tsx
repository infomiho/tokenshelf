import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor, within } from "storybook/test";
import { SubmissionActions } from "./SubmissionActions";

const meta = {
  title: "Product/Submit/SubmissionActions",
  component: SubmissionActions,
  parameters: { layout: "centered" },
  args: {
    name: "Gridline",
    state: "idle",
    onEdit: fn(async () => true),
    onDelete: fn(async () => true),
  },
} satisfies Meta<typeof SubmissionActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Actions for Gridline" });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.click(await page.findByRole("menuitem", { name: "Delete" }));

    await expect(page.getByRole("alertdialog", { name: "Delete Gridline?" })).toBeVisible();
    const cancel = page.getByRole("button", { name: "Cancel" });
    await expect(cancel).toHaveFocus();
    await userEvent.click(cancel);
    await expect(trigger).toHaveFocus();
  },
};

export const Edit: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Actions for Gridline" }));
    await userEvent.click(await page.findByRole("menuitem", { name: "Edit" }));
    await expect(args.onEdit).toHaveBeenCalledOnce();
    await waitFor(() => expect(page.queryByRole("menu")).not.toBeInTheDocument());
  },
};

export const ConfirmDelete: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Actions for Gridline" }));
    await userEvent.click(await page.findByRole("menuitem", { name: "Delete" }));
    await userEvent.click(page.getByRole("button", { name: "Delete" }));
    await expect(args.onDelete).toHaveBeenCalledOnce();
  },
};

export const DeleteFailureReturnsFocus: Story = {
  args: { onDelete: fn(async () => false) },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Actions for Gridline" });
    await userEvent.click(trigger);
    await userEvent.click(await page.findByRole("menuitem", { name: "Delete" }));
    await userEvent.click(page.getByRole("button", { name: "Delete" }));

    await expect(args.onDelete).toHaveBeenCalledOnce();
    await waitFor(() => expect(page.queryByRole("alertdialog")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

export const ContinueEditing: Story = {
  args: { editingPublishedSystem: true },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Actions for Gridline" }));
    await userEvent.click(await page.findByRole("menuitem", { name: "Continue editing" }));

    await expect(args.onEdit).toHaveBeenCalledOnce();
    await waitFor(() => expect(page.queryByRole("menu")).not.toBeInTheDocument());
  },
};
