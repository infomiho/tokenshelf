import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";
import { ToastProvider, useToast } from "./Toast";

function ToastExamples() {
  const toast = useToast();

  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => toast.success("Draft changes discarded")}>Show success</Button>
      <Button
        variant="secondary"
        onClick={() => toast.error("Unable to start editing. Try again.")}
      >
        Show error
      </Button>
    </div>
  );
}

const meta = {
  title: "Components/Toast",
  component: ToastExamples,
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Use success toasts when an action removes its source or changes route. Use persistent error toasts for unexpected action failures. Keep field validation, page-load failures, and conflicts requiring recovery inline.",
      },
    },
  },
} satisfies Meta<typeof ToastExamples>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Feedback: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Show success" }));
    await userEvent.click(canvas.getByRole("button", { name: "Show error" }));
  },
};
