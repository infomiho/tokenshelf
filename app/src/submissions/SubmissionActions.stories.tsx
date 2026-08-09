import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor, within } from "storybook/test";
import { SubmissionActions } from "./SubmissionActions";
import type { DiscardDraftResult } from "./useDiscardDraftFlow";

const meta = {
  title: "Product/Submit/SubmissionActions",
  component: SubmissionActions,
  parameters: { layout: "centered" },
  args: {
    name: "Gridline",
    state: "idle",
    deleteError: null,
    onEdit: fn(async () => true),
    onDiscard: fn<() => Promise<DiscardDraftResult>>(async () => "discarded"),
    onReviewLatestDraft: fn(async () => true),
    onDelete: fn(async () => true),
    onDeleteDialogOpen: fn(),
  },
} satisfies Meta<typeof SubmissionActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Actions for Gridline" });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.click(await page.findByRole("menuitem", { name: "Delete design system" }));

    await expect(args.onDeleteDialogOpen).toHaveBeenCalledOnce();
    await expect(page.getByRole("alertdialog", { name: "Delete Gridline?" })).toBeVisible();
    const cancel = page.getByRole("button", { name: "Cancel" });
    await expect(cancel).toHaveFocus();
    await userEvent.click(cancel);
    await expect(trigger).toHaveFocus();
  },
};

export const DeleteError: Story = {
  args: { deleteError: "Unable to delete this design system. Try again." },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Actions for Gridline" }));
    await userEvent.click(await page.findByRole("menuitem", { name: "Delete design system" }));
    await expect(page.getByRole("alert")).toHaveTextContent(
      "Unable to delete this design system. Try again.",
    );
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
    await userEvent.click(await page.findByRole("menuitem", { name: "Delete design system" }));
    await userEvent.click(page.getByRole("button", { name: "Delete design system" }));
    await expect(args.onDelete).toHaveBeenCalledOnce();
  },
};

export const DiscardPublishedDraft: Story = {
  args: { editingPublishedSystem: true, hasDraftChanges: true },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Actions for Gridline" }));
    await userEvent.click(await page.findByRole("menuitem", { name: "Discard draft changes" }));
    await userEvent.click(page.getByRole("button", { name: "Discard draft changes" }));
    await expect(args.onDiscard).toHaveBeenCalledOnce();
  },
};

export const DiscardConflict: Story = {
  args: {
    editingPublishedSystem: true,
    hasDraftChanges: true,
    onDiscard: fn<() => Promise<DiscardDraftResult>>(async () => "conflict"),
  },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Actions for Gridline" }));
    await userEvent.click(await page.findByRole("menuitem", { name: "Discard draft changes" }));
    await userEvent.click(page.getByRole("button", { name: "Discard draft changes" }));

    await expect(page.getByRole("alertdialog", { name: "Draft changed" })).toBeVisible();
    await userEvent.click(page.getByRole("button", { name: "Review latest draft" }));
    await expect(args.onReviewLatestDraft).toHaveBeenCalledOnce();
  },
};

export const StopUnchangedEdit: Story = {
  args: { editingPublishedSystem: true, hasDraftChanges: false },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Actions for Gridline" }));
    await userEvent.click(await page.findByRole("menuitem", { name: "Stop editing" }));

    await expect(args.onDiscard).toHaveBeenCalledOnce();
    await expect(page.queryByRole("alertdialog")).not.toBeInTheDocument();
  },
};
