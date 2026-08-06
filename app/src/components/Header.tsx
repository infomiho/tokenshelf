import { useState } from "react";
import { useCurrentUser } from "../auth/useCurrentUser";
import { SignInDialog } from "./auth/SignInDialog";
import { HeaderView, type HeaderNavigationItem } from "./HeaderView";

const navigation: readonly HeaderNavigationItem[] = [
  { to: "/", label: "Top", end: true },
  { to: "/hot", label: "Hot" },
  { to: "/new", label: "New" },
];

export function Header() {
  const [signInOpen, setSignInOpen] = useState(false);
  const { user, signIn, signOut } = useCurrentUser();

  return (
    <>
      <HeaderView
        user={user}
        navigation={navigation}
        onSignIn={() => setSignInOpen(true)}
        onSignOut={signOut}
      />
      <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} onSignIn={signIn} />
    </>
  );
}
