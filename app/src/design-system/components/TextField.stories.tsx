import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { TextField } from "./TextField";

const meta = {
  title: "Components/TextField",
  component: TextField,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[min(28rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  args: {
    label: "System name",
    placeholder: "For example, Editorial contrast",
    onChange: fn(),
  },
  argTypes: {
    size: { control: "inline-radio", options: ["compact", "default", "touch"] },
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { description: "Use a short, distinctive name." },
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "System name" });
    await userEvent.click(input);
    await userEvent.type(input, "Signal");
    await expect(input).toHaveValue("Signal");
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="grid gap-5">
      <TextField label="Compact field" size="compact" placeholder="Compact" />
      <TextField label="Default field" placeholder="Default" />
      <TextField label="Touch field" size="touch" placeholder="Touch" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="grid gap-5">
      <TextField
        label="With guidance"
        description="Your public display name."
        defaultValue="Studio North"
      />
      <TextField
        label="Invalid capability link"
        error="Enter a valid HTTPS link."
        defaultValue="tokenshelf.local"
      />
      <TextField label="Disabled field" disabled defaultValue="Published system" />
      <TextField
        label="Read-only field"
        readOnly
        defaultValue="TS-2048"
        description="Generated automatically."
      />
    </div>
  ),
};
