import { describe, expect, it } from "vitest";
import type { SystemCardData } from "../data/catalog";
import { selectHomeSystemRow } from "./home";

const system = (id: string) => ({ id }) as SystemCardData;

describe("landing system row", () => {
  it("shows previous picks below the current daily pick", () => {
    expect(selectHomeSystemRow(system("today"), [system("yesterday")], [system("latest")])).toEqual(
      {
        kind: "previous",
        systems: [system("yesterday")],
      },
    );
  });

  it("shows latest systems below the empty state when there is no pick history", () => {
    expect(selectHomeSystemRow(null, [], [system("latest")])).toEqual({
      kind: "latest",
      systems: [system("latest")],
    });
  });

  it("keeps previous picks below the empty state while today's pick is undecided", () => {
    expect(selectHomeSystemRow(null, [system("previous")], [system("latest")])).toEqual({
      kind: "previous",
      systems: [system("previous")],
    });
  });
});
