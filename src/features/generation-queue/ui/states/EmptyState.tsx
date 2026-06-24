import { CircleDashed } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-[var(--c-line)] py-16 text-center">
      <CircleDashed size={28} className="text-[var(--c-fg-low)]" />
      <p className="text-sm text-[var(--c-fg-mute)]">Нет задач</p>
    </div>
  );
}
