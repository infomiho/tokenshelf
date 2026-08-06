import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../design-system/components";
import { LogoMark } from "../design-system/components";
import { PageMessage } from "./PageMessage";

const meta = {
  title: "Product/PageMessage",
  component: PageMessage,
  parameters: { layout: "fullscreen" },
  args: {
    eyebrow: "Not found",
    title: "This shelf is empty",
    description: "The page may have moved, or the design system is no longer published.",
    icon: <LogoMark className="mx-auto size-12 text-brand" aria-hidden="true" />,
    action: <Button>Return home</Button>,
  },
} satisfies Meta<typeof PageMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FocusedError: Story = {
  args: {
    eyebrow: "Submission error",
    title: "We could not load this submission",
    focusHeading: true,
  },
};
