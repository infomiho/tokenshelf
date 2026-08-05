import { defineUserSignupFields } from "wasp/server/auth";

type GitHubProfile = {
  profile?: { login?: string; name?: string; avatar_url?: string };
};

export const userSignupFields = defineUserSignupFields({
  displayName: (data: GitHubProfile) => data.profile?.name ?? data.profile?.login ?? null,
  githubHandle: (data: GitHubProfile) => data.profile?.login?.toLowerCase() ?? null,
  avatarUrl: (data: GitHubProfile) => data.profile?.avatar_url ?? null,
});
