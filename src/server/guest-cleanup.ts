export type GuestSubmissionActivity = {
  updatedAt: Date;
  draft: { updatedAt: Date } | null;
  guestSession: { lastUsedAt: Date } | null;
  agentSessions: Array<{ lastUsedAt: Date | null }>;
};

export function guestSubmissionLastActivity(candidate: GuestSubmissionActivity) {
  return new Date(
    Math.max(
      candidate.updatedAt.getTime(),
      candidate.draft?.updatedAt.getTime() ?? 0,
      candidate.guestSession?.lastUsedAt.getTime() ?? 0,
      ...candidate.agentSessions.map(({ lastUsedAt }) => lastUsedAt?.getTime() ?? 0),
    ),
  );
}
