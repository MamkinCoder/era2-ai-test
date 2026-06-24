import type { QueueSortMode } from "./queue-page.types";

export interface QueueSortSelectProps {
  value: QueueSortMode;
  onChange: (value: QueueSortMode) => void;
}

const OPTIONS: { value: QueueSortMode; label: string }[] = [
  { value: "newest", label: "Сначала новые" },
  { value: "oldest", label: "Сначала старые" },
  { value: "activeFirst", label: "Сначала активные" },
];

export function QueueSortSelect({ value, onChange }: QueueSortSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as QueueSortMode)}
        className="appearance-none h-[34px] pl-[14px] pr-10 rounded-full bg-[var(--c-bg-2)] text-[13px] text-[var(--c-fg-dim)] outline-none cursor-pointer"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] text-[var(--c-fg-mute)]">
        ▾
      </span>
    </div>
  );
}
