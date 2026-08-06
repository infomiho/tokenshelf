import { githubSignInUrl, logout, useAuth } from "wasp/client/auth";
import { useLocation } from "react-router";
import type { UserProfile } from "../data/submissions";
import { authReturnKey } from "./auth-storage";

export function useCurrentUser() {
  const auth = useAuth();
  const location = useLocation();
  const user = auth.data ? toUserProfile(auth.data as AuthProfile) : null;

  return {
    user,
    signIn: () => {
      window.sessionStorage.setItem(authReturnKey, location.pathname + location.search);
      window.location.href = githubSignInUrl;
    },
    signOut: () => {
      void logout();
    },
  };
}

export type AuthProfile = {
  id: string;
  displayName?: string | null;
  githubHandle?: string | null;
  avatarUrl?: string | null;
  identities?: { github?: { id: string } | null };
};

export function toUserProfile(user: AuthProfile): UserProfile {
  const handle = user.githubHandle ?? user.identities?.github?.id ?? "GitHub user";
  return {
    id: user.id,
    name: user.displayName ?? handle,
    handle,
    username: user.githubHandle ?? undefined,
    avatarUrl: user.avatarUrl ?? `https://github.com/${handle}.png?size=80`,
  };
}
