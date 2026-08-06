import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import type { TagSuggestion } from "../data/catalog";
import { Button, TextField } from "../design-system/components";
import { normalizeTagKey } from "../lib/tags";

type BrowseToolbarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  tagSuggestions: TagSuggestion[];
};

export function BrowseToolbar({ query, onQueryChange, tagSuggestions }: BrowseToolbarProps) {
  const normalizedQuery = normalizeTagKey(query);
  const suggestions = tagSuggestions
    .filter(({ label }) => !normalizedQuery || normalizeTagKey(label).includes(normalizedQuery))
    .slice(0, 4);

  return (
    <div>
      <div className="relative w-full max-w-md">
        <MagnifyingGlassIcon
          className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <TextField
          label="Search systems"
          value={query}
          onValueChange={onQueryChange}
          className="gap-0 [&>label:first-child]:sr-only"
          inputClassName="rounded-[var(--radius-round)] pl-9"
          placeholder="Search names, descriptions, or tags"
        />
      </div>
      {suggestions.length > 0 && (
        <div
          className="mt-3 flex min-h-8 flex-wrap items-center gap-2"
          role="group"
          aria-label="Suggested tags"
        >
          <span className="mr-1 text-sm text-muted">
            {normalizedQuery ? "Matching tags" : "Popular tags"}
          </span>
          {suggestions.map(({ label, count }) => (
            <Button
              key={normalizeTagKey(label)}
              variant="quiet"
              size="compact"
              aria-label={`${label}, ${count} ${count === 1 ? "system" : "systems"}`}
              onClick={() => onQueryChange(label)}
            >
              {label} <span className="text-muted">{count}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
