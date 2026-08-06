export type DailyPickCandidate = { id: string; publishedAt: Date; votes: number };

export function rankDailyPickCandidates<T extends DailyPickCandidate>(candidates: T[]) {
  return candidates
    .filter(({ votes }) => votes > 0)
    .sort(
      (left, right) =>
        right.votes - left.votes ||
        left.publishedAt.getTime() - right.publishedAt.getTime() ||
        left.id.localeCompare(right.id),
    );
}
