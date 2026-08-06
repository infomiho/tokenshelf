import { useDeferredValue, useState } from "react";

export function useSystemSearch() {
  const [query, setQuery] = useState(() =>
    typeof window === "undefined"
      ? ""
      : (new URLSearchParams(window.location.search).get("q") ?? ""),
  );
  const deferredQuery = useDeferredValue(query.trim());

  const updateQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (nextQuery.trim()) url.searchParams.set("q", nextQuery);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  };

  const isFiltering = query.trim().length > 0;
  const clearFilters = () => updateQuery("");

  return { query, deferredQuery, setQuery: updateQuery, isFiltering, clearFilters };
}
