import { ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { SpinnerGap } from "@phosphor-icons/react/dist/csr/SpinnerGap";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { Button, type ButtonVariant } from "./Button";
import type { ControlSize } from "./controlStyles";

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: { layout: "centered" },
  args: {
    children: "Add to shelf",
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "quiet", "destructive", "onDark", "onDarkSecondary"],
    },
    size: { control: "inline-radio", options: ["compact", "default", "touch"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { variant: "primary", size: "default" },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Add to shelf" });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

const variants: ButtonVariant[] = [
  "primary",
  "secondary",
  "quiet",
  "destructive",
  "onDark",
  "onDarkSecondary",
];
const sizes: ControlSize[] = ["compact", "default", "touch"];

export const VariantAndSizeMatrix: Story = {
  render: () => (
    <div className="grid gap-5 rounded-[var(--radius-card)] bg-surface p-6">
      {variants.map((variant) => (
        <div
          key={variant}
          className={`grid grid-cols-3 items-center gap-3 rounded-[var(--radius-control)] p-3 ${variant.startsWith("onDark") ? "bg-feature" : ""}`}
        >
          {sizes.map((size) => (
            <Button key={size} variant={variant} size={size}>
              {variant}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const ContentAndStates: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button>Text only</Button>
      <Button variant="secondary">
        Continue <ArrowRight size={16} aria-hidden="true" />
      </Button>
      <Button disabled>Disabled</Button>
      <Button disabled aria-busy="true" aria-label="Saving changes">
        <SpinnerGap className="animate-spin" size={16} aria-hidden="true" /> Saving
      </Button>
    </div>
  ),
};
