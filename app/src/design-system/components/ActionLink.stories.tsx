import { ArrowUpRight } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { ActionLink } from "./ActionLink";
import type { ButtonVariant } from "./Button";
import type { ControlSize } from "./controlStyles";

const meta = {
  title: "Components/ActionLink",
  component: ActionLink,
  parameters: { layout: "centered" },
  args: {
    children: "View design system",
    href: "#design-system",
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "quiet", "onDark", "onDarkSecondary"],
    },
    size: { control: "inline-radio", options: ["compact", "default", "touch"] },
  },
} satisfies Meta<typeof ActionLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const link = canvas.getByRole("link", { name: "View design system" });
    link.addEventListener("click", (event) => event.preventDefault(), { once: true });
    await userEvent.click(link);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

const variants: ButtonVariant[] = ["primary", "secondary", "quiet", "onDark", "onDarkSecondary"];
const sizes: ControlSize[] = ["compact", "default", "touch"];

export const VariantAndSizeMatrix: Story = {
  render: () => (
    <div className="grid gap-4 rounded-[var(--radius-card)] bg-surface p-6">
      {variants.map((variant) => (
        <div
          key={variant}
          className={`flex flex-wrap gap-3 rounded-[var(--radius-control)] p-3 ${variant.startsWith("onDark") ? "bg-feature" : ""}`}
        >
          {sizes.map((size) => (
            <ActionLink key={size} href="#example" variant={variant} size={size}>
              {variant}
            </ActionLink>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const ExternalDestination: Story = {
  args: {
    children: (
      <>
        Open documentation <ArrowUpRight size={16} aria-hidden="true" />
      </>
    ),
    href: "https://example.com",
    target: "_blank",
    rel: "noreferrer",
  },
};
