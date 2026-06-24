const BADGE: Record<string, { label: string; bg: string; color: string }> = {
  running: { label: "Идёт", bg: "var(--c-accent-soft)", color: "var(--c-accent-2)" },
  queued: { label: "В очереди", bg: "var(--c-bg-2)", color: "var(--c-fg-mute)" },
  done: { label: "Готово", bg: "rgba(16,185,129,0.13)", color: "#34D399" },
  failed: { label: "Ошибка", bg: "rgba(255,90,90,0.12)", color: "#FF6B6B" },
  cancelled: { label: "Отменено", bg: "var(--c-bg-2)", color: "var(--c-fg-low)" },
};

export function StatusBadge({ status }: { status: string }) {
  const b = BADGE[status];
  if (!b) return null;
  return (
    <span
      className="flex items-center h-[26px] px-2.5 text-[12px] font-medium whitespace-nowrap rounded-[8px]"
      style={{ background: b.bg, color: b.color }}
    >
      {b.label}
    </span>
  );
}
