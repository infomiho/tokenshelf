import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import { fn } from "storybook/test";
import { HeaderView, type HeaderNavigationItem } from "./HeaderView";

const navigation: readonly HeaderNavigationItem[] = [
  { to: "/", label: "Top", end: true },
  { to: "/hot", label: "Hot" },
  { to: "/new", label: "New" },
];

const meta = {
  title: "Product/Header",
  component: HeaderView,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/hot"]}>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {
    user: null,
    navigation,
    onSignIn: fn(),
    onSignOut: fn(),
  },
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof HeaderView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedOut: Story = {};

export const SignedIn: Story = {
  args: {
    user: {
      id: "user-1",
      name: "Mara Vale",
      handle: "Mara Vale",
      username: "maravale",
      avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Mara%20Vale",
    },
  },
};

export const Mobile: Story = {
  globals: {
    viewport: "mobile1",
  },
};
