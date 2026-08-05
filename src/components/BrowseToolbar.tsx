import { ToggleGroup } from "@base-ui/react/toggle-group";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { vibeOptions, type Vibe } from "../data/catalog";
import { Chip, TextField } from "../design-system/components";

type BrowseToolbarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  vibe: Vibe;
  onVibeChange: (vibe: Vibe) => void;
};

export function BrowseToolbar({ query, onQueryChange, vibe, onVibeChange }: BrowseToolbarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="filter-scroll">
        <ToggleGroup
          value={[vibe]}
          onValueChange={([nextVibe]) => onVibeChange(nextVibe ?? "All")}
          className="no-scrollbar flex gap-2 overflow-x-auto pb-1 pr-10 sm:pr-0"
          aria-label="Filter by vibe"
        >
          {vibeOptions.map((option) => (
            <Chip key={option} value={option}>
              {option}
            </Chip>
          ))}
        </ToggleGroup>
      </div>
      <div className="relative w-full sm:max-w-64">
        <MagnifyingGlassIcon
          className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <TextField
          label="Filter systems"
          value={query}
          onValueChange={onQueryChange}
          className="gap-0 [&>label:first-child]:sr-only"
          inputClassName="rounded-[var(--radius-round)] pl-9"
          placeholder="Filter this view"
        />
      </div>
    </div>
  );
}
