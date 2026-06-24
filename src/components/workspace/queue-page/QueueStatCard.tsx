export type QueueStatCardTone = "muted" | "accent" | "success" | "danger";

export interface QueueStatCardProps {
  label: string;
  count: number;
  tone: QueueStatCardTone;
}

const DOT_COLOR: Record<QueueStatCardTone, string> = {
  muted:   "var(--c-fg-mute)",
  accent:  "var(--c-accent)",
  success: "#34D399",
  danger:  "#FF6B6B",
};

export function QueueStatCard({ label, count, tone }: QueueStatCardProps) {
  return (
    <div className="bg-[var(--bg-card)] rounded-[16px] h-[82px] md:h-[94px] flex flex-col justify-between pl-[14px] md:pl-[18px] pt-[14px] md:pt-4 pb-[14px] md:pb-[11px] pr-4 border border-[#2d2420]">
      <div className="flex items-center gap-[16px]">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: DOT_COLOR[tone] }}
        />
        <span className="text-[13px] text-[var(--c-fg-mute)]">{label}</span>
      </div>
      <span className="font-mono text-[24px] md:text-[28px] font-bold text-[var(--c-fg)] tabular-nums leading-none">
        {count}
      </span>
    </div>
  );
}
