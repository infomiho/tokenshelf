import type { SystemCardData } from "../data/catalog";

export type HomeSystemRow = {
  kind: "previous" | "latest";
  systems: SystemCardData[];
};

export function selectHomeSystemRow(
  dailyPick: SystemCardData | null,
  previousPicks: SystemCardData[],
  latestSystems: SystemCardData[],
): HomeSystemRow | null {
  if (previousPicks.length > 0) return { kind: "previous", systems: previousPicks };
  const latestWithoutDailyPick = latestSystems
    .filter((system) => system.id !== dailyPick?.id)
    .slice(0, 4);
  return latestWithoutDailyPick.length > 0
    ? { kind: "latest", systems: latestWithoutDailyPick }
    : null;
}
