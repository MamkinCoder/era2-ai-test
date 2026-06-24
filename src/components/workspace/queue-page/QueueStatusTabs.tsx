import type { QueueStatusFilter } from "./queue-page.types";

export interface QueueStatusTabsProps {
  value: QueueStatusFilter;
  onChange: (value: QueueStatusFilter) => void;
}

const TABS: { value: QueueStatusFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "queued", label: "В очереди" },
  { value: "running", label: "Идёт" },
  { value: "done", label: "Готово" },
  { value: "failed", label: "Ошибка" },
];

export function QueueStatusTabs({ value, onChange }: QueueStatusTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-nowrap md:flex-wrap pb-0.5 md:pb-0">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`h-[34px] px-[14px] rounded-full text-[13px] font-medium transition-colors shrink-0 ${
            value === tab.value
              ? "bg-[var(--c-accent)] text-white"
              : "bg-[var(--c-bg-2)] text-[var(--c-fg-dim)] hover:text-[var(--c-fg)]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
