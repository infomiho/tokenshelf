import { describe, expect, it } from "vitest";
import { rankDailyPickCandidates } from "./ranking";

describe("daily pick ranking", () => {
  it("uses votes only, then earlier publication, then stable id", () => {
    const date = new Date("2026-08-01T00:00:00Z");
    const later = new Date("2026-08-02T00:00:00Z");
    const ranked = rankDailyPickCandidates([
      { id: "z", votes: 3, publishedAt: date },
      { id: "b", votes: 5, publishedAt: later },
      { id: "a", votes: 5, publishedAt: later },
      { id: "old", votes: 5, publishedAt: date },
    ]);
    expect(ranked.map(({ id }) => id)).toEqual(["old", "a", "b", "z"]);
  });

  it("returns no winner when nobody voted", () => {
    expect(rankDailyPickCandidates([{ id: "a", votes: 0, publishedAt: new Date() }])).toEqual([]);
  });
});
