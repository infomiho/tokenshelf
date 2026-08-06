export type SubmissionAccessSubject = {
  userId?: string;
  guestSessionId?: string;
};

export type SubmissionAccessTarget = {
  ownerId: string | null;
  guestSessionId: string | null;
};

export function canAccessSubmission(
  target: SubmissionAccessTarget,
  subject: SubmissionAccessSubject,
) {
  if (subject.userId && target.ownerId === subject.userId) return true;
  return Boolean(
    subject.guestSessionId && !target.ownerId && target.guestSessionId === subject.guestSessionId,
  );
}

export type AgentAuthorityDecision = "allowed" | "expired" | "revoked" | "forbidden";

export function decideAgentAuthority(
  target: { id: string; sessionGeneration: number },
  session: { submissionId: string; generation: number; expiresAt: Date } | null,
  now: Date,
): AgentAuthorityDecision {
  if (!session || session.submissionId !== target.id) return "forbidden";
  if (session.generation !== target.sessionGeneration) return "revoked";
  if (session.expiresAt <= now) return "expired";
  return "allowed";
}
