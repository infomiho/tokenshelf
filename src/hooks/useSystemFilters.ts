import { useDeferredValue, useState } from "react";
import type { DesignSystem, Vibe } from "../data/catalog";

export function useSystemFilters(items: DesignSystem[]) {
  const [query, setQuery] = useState(() =>
    typeof window === "undefined"
      ? ""
      : (new URLSearchParams(window.location.search).get("q") ?? ""),
  );
  const [vibe, setVibe] = useState<Vibe>("All");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const filteredSystems = items.filter((system) => {
    const matchesVibe = vibe === "All" || system.tags.includes(vibe);
    const searchable = [
      system.name,
      system.description,
      system.renderer.typography.authoredFamily,
      system.inspiration?.company,
      system.inspiration?.system,
      ...system.tags,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return matchesVibe && searchable.includes(deferredQuery);
  });

  const isFiltering = query.length > 0 || vibe !== "All";
  const clearFilters = () => {
    setQuery("");
    setVibe("All");
  };

  return { query, setQuery, vibe, setVibe, filteredSystems, isFiltering, clearFilters };
}
