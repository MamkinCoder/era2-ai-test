import { useState, useEffect } from "react";
import { QueueStatusTabs } from "./QueueStatusTabs";
import { QueueSortSelect } from "./QueueSortSelect";
import type { QueueStatusFilter, QueueSortMode } from "./queue-page.types";

export interface QueueToolbarProps {
  status: QueueStatusFilter;
  sort: QueueSortMode;
  search: string;
  onStatusChange: (status: QueueStatusFilter) => void;
  onSortChange: (sort: QueueSortMode) => void;
  onSearchChange: (query: string) => void;
}

export function QueueToolbar({
  status,
  sort,
  search,
  onStatusChange,
  onSortChange,
  onSearchChange,
}: QueueToolbarProps) {
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    const t = setTimeout(() => onSearchChange(localSearch.trim()), 300);
    return () => clearTimeout(t);
  }, [localSearch, onSearchChange]);

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: status chips + sort */}
      <div className="flex items-center justify-between gap-4">
        <QueueStatusTabs value={status} onChange={onStatusChange} />
        <div className="shrink-0">
          <QueueSortSelect value={sort} onChange={onSortChange} />
        </div>
      </div>

      {/* Row 2: search */}
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-[var(--c-fg-low)]">
          ⌕
        </span>
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Поиск по промпту…"
          className="w-full h-[38px] pl-9 pr-9 bg-[var(--c-bg-2)] border border-[#2d2420] rounded-full text-[13px] text-[var(--c-fg)] placeholder:text-[var(--c-fg-low)] outline-none focus:border-[var(--c-accent)] transition-colors"
        />
        {localSearch && (
          <button
            onClick={() => setLocalSearch("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] text-[var(--c-fg-low)] hover:text-[var(--c-fg-mute)] transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
