import { useState, useEffect } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import type { QueueStatusFilter, QueueSortMode } from "../model/selectors";

const STATUS_TABS: { value: QueueStatusFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "queued", label: "В очереди" },
  { value: "running", label: "Идёт" },
  { value: "done", label: "Готово" },
  { value: "failed", label: "Ошибка" },
];

const SORT_OPTIONS: { value: QueueSortMode; label: string }[] = [
  { value: "newest", label: "Сначала новые" },
  { value: "oldest", label: "Сначала старые" },
  { value: "activeFirst", label: "Сначала активные" },
];

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-nowrap md:flex-wrap pb-0.5 md:pb-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onStatusChange(tab.value)}
              className={`h-[34px] px-[14px] rounded-full text-[13px] font-medium transition-colors shrink-0 ${
                status === tab.value
                  ? "bg-[var(--c-accent)] text-white"
                  : "bg-[var(--c-bg-2)] text-[var(--c-fg-dim)] hover:text-[var(--c-fg)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="shrink-0 relative self-start">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as QueueSortMode)}
            className="appearance-none h-[34px] pl-[14px] pr-10 rounded-full bg-[var(--c-bg-2)] text-[13px] text-[var(--c-fg-dim)] outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--c-fg-mute)]"
          />
        </div>
      </div>

      <div className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--c-fg-low)]"
        />
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
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--c-fg-low)] hover:text-[var(--c-fg-mute)] transition-colors"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
