import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { useRef } from "react";
import type { TagSuggestion } from "../data/catalog";
import { Button, IconButton, TextField } from "../design-system/components";
import { normalizeTagKey } from "../domain/design-system/tags";

type BrowseToolbarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  tagSuggestions: TagSuggestion[];
};

export function BrowseToolbar({ query, onQueryChange, tagSuggestions }: BrowseToolbarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = normalizeTagKey(query);
  const suggestions = tagSuggestions
    .filter(({ label }) => !normalizedQuery || normalizeTagKey(label).includes(normalizedQuery))
    .slice(0, 4);

  return (
    <div>
      <div className="relative w-full max-w-md">
        <MagnifyingGlassIcon
          className="pointer-events-none absolute start-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <TextField
          ref={searchInputRef}
          label="Search systems"
          value={query}
          onValueChange={onQueryChange}
          className="gap-0 [&>label:first-child]:sr-only"
          inputClassName="rounded-[var(--radius-round)] pe-11 ps-9"
          placeholder="Search names, descriptions, or tags"
        />
        {query && (
          <IconButton
            label="Clear search"
            variant="quiet"
            size="compact"
            className="absolute end-1 top-1/2 z-10 -translate-y-1/2 rounded-full text-muted hover:bg-transparent hover:text-ink"
            onClick={() => {
              onQueryChange("");
              searchInputRef.current?.focus();
            }}
          >
            <XIcon className="size-4" weight="bold" aria-hidden="true" />
          </IconButton>
        )}
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
