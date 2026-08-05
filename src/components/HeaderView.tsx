import { Collapsible } from "@base-ui/react/collapsible";
import { Menu } from "@base-ui/react/menu";
import { ListIcon } from "@phosphor-icons/react/dist/csr/List";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { useState } from "react";
import { Link, NavLink } from "react-router";
import type { UserProfile } from "../data/submissions";
import {
  actionLinkClassName,
  Button,
  buttonClassName,
  controlSizeClassName,
  IconButton,
  menuItemClassName,
  PageContainer,
} from "../design-system/components";
import { LogoMark } from "./LogoMark";

export type HeaderNavigationItem = {
  to: "/" | "/hot" | "/new";
  label: string;
  end?: boolean;
};

type HeaderViewProps = {
  user: UserProfile | null;
  navigation: readonly HeaderNavigationItem[];
  onSignIn: () => void;
  onSignOut: () => void;
};

export function HeaderView({ user, navigation, onSignIn, onSignOut }: HeaderViewProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleSignIn() {
    closeMenu();
    onSignIn();
  }

  function handleSignOut() {
    onSignOut();
    closeMenu();
  }

  return (
    <Collapsible.Root open={menuOpen} onOpenChange={setMenuOpen}>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/92 backdrop-blur-xl">
        <PageContainer className="flex h-15 items-center gap-5">
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-2.5 no-underline"
            aria-label="Tokenshelf home"
          >
            <LogoMark className="size-8 text-brand" />
            <span className="text-base font-bold tracking-[-0.025em] [font-family:var(--font-brand)]">
              Tokenshelf
            </span>
          </Link>

          <nav className="hidden md:block" aria-label="Main navigation">
            <NavigationSelector navigation={navigation} />
          </nav>

          <div className="ml-auto hidden items-center gap-2 sm:flex">
            {user ? (
              <Menu.Root>
                <Menu.Trigger
                  className={buttonClassName("quiet", "shrink-0", { pressScale: false })}
                >
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="size-7 rounded-full outline outline-1 outline-black/10"
                  />
                  {user.handle}
                </Menu.Trigger>
                <Menu.Portal>
                  <Menu.Positioner
                    align="end"
                    sideOffset={8}
                    className="z-[var(--z-overlay)] outline-none"
                  >
                    <Menu.Popup className="min-w-48 rounded-[var(--radius-control)] border border-line bg-surface p-1 shadow-[var(--shadow-overlay)] outline-none">
                      {user.username && (
                        <Menu.LinkItem
                          render={<Link to={`/@${user.username}`} />}
                          className={menuItemClassName()}
                        >
                          Profile
                        </Menu.LinkItem>
                      )}
                      <Menu.LinkItem
                        render={<Link to="/submissions" />}
                        className={menuItemClassName()}
                      >
                        Your design systems
                      </Menu.LinkItem>
                      <Menu.Separator className="my-1 h-px bg-line" />
                      <Menu.Item className={menuItemClassName()} onClick={onSignOut}>
                        Sign out
                      </Menu.Item>
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.Root>
            ) : (
              <Button variant="quiet" onClick={onSignIn}>
                Sign in
              </Button>
            )}
            <Link to="/submit" className={actionLinkClassName("primary", "shrink-0")}>
              Submit a system
            </Link>
          </div>

          <Collapsible.Trigger
            render={
              <IconButton
                label={menuOpen ? "Close navigation" : "Open navigation"}
                variant="quiet"
                className="ml-auto md:hidden"
              >
                {menuOpen ? (
                  <XIcon className="size-5" aria-hidden="true" />
                ) : (
                  <ListIcon className="size-5" aria-hidden="true" />
                )}
              </IconButton>
            }
          />
        </PageContainer>

        <Collapsible.Panel
          render={<nav aria-label="Mobile navigation" />}
          className="border-t border-line py-4 md:hidden"
        >
          <PageContainer className="grid gap-1">
            <NavigationSelector navigation={navigation} grouped onSelect={closeMenu} />
            <div className="mt-3 grid gap-1 border-t border-line pt-3">
              {user ? (
                <>
                  <p className="px-3 pb-1 text-xs font-semibold text-muted">{user.handle}</p>
                  {user.username && (
                    <Link
                      to={`/@${user.username}`}
                      onClick={closeMenu}
                      className={menuItemClassName("", "touch")}
                    >
                      Profile
                    </Link>
                  )}
                  <Link
                    to="/submissions"
                    onClick={closeMenu}
                    className={menuItemClassName("", "touch")}
                  >
                    Your design systems
                  </Link>
                  <button
                    type="button"
                    className={menuItemClassName("text-start", "touch")}
                    onClick={handleSignOut}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={menuItemClassName("text-start", "touch")}
                  onClick={handleSignIn}
                >
                  Sign in
                </button>
              )}
              <Link
                to="/submit"
                onClick={closeMenu}
                className={actionLinkClassName("primary", "mt-2", { size: "touch" })}
              >
                Submit a system
              </Link>
            </div>
          </PageContainer>
        </Collapsible.Panel>
      </header>
    </Collapsible.Root>
  );
}

function NavigationSelector({
  navigation,
  grouped = false,
  onSelect,
}: {
  navigation: readonly HeaderNavigationItem[];
  grouped?: boolean;
  onSelect?: () => void;
}) {
  return (
    <div
      className={
        grouped
          ? "grid grid-cols-3 gap-1 rounded-[var(--radius-control)] border border-line bg-surface p-1"
          : "flex items-center gap-1"
      }
    >
      {navigation.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onSelect}
          className={({ isActive }) =>
            `grid ${controlSizeClassName("compact")} place-items-center rounded-[var(--radius-inset)] px-4 text-sm font-semibold no-underline transition-colors ${isActive ? "bg-ink/5 text-ink" : "text-muted hover:bg-ink/[0.035] hover:text-ink"}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}
