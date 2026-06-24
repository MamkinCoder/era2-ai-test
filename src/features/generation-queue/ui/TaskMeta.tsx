import type { QueueTaskViewModel } from "../model/selectors";

function ModelPill({ modelName }: { modelName: string }) {
  return (
    <span className="inline-flex items-center h-[22px] pl-[8px] pr-[8px] gap-[6px] bg-[var(--c-bg-2)] rounded-full">
      <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-[var(--c-accent)]" />
      <span className="font-mono text-[12px] text-[var(--c-fg-dim)] whitespace-nowrap leading-none">
        {modelName}
      </span>
    </span>
  );
}

export function TaskMeta({
  modelName,
  status,
  credits,
  durationLabel,
  queuePosition,
  errorMessage,
  compact,
}: Pick<QueueTaskViewModel, "modelName" | "status" | "credits" | "durationLabel" | "queuePosition" | "errorMessage"> & { compact?: boolean }) {
  let metaText: string | null = null;

  if (status === "running" && durationLabel) {
    metaText = `${durationLabel} · ${credits} cr`;
  } else if (status === "queued" && queuePosition !== undefined) {
    metaText = compact
      ? `позиция ${queuePosition} · ${credits} cr`
      : `позиция ${queuePosition} в очереди · ${credits} cr`;
  } else if (status === "done" && durationLabel) {
    const short = durationLabel.replace("готово за ", "за ");
    metaText = compact ? `${short} · ${credits} cr` : `${durationLabel} · ${credits} cr`;
  } else if (status === "failed") {
    metaText = errorMessage ?? "ошибка генерации";
  } else if (status === "cancelled") {
    metaText = "отменено пользователем";
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <ModelPill modelName={modelName} />
      {metaText && (
        <>
          {!compact && <span className="text-[12px] text-[var(--c-fg-low)]">·</span>}
          <span className="text-[12px] text-[var(--c-fg-mute)]">{metaText}</span>
        </>
      )}
    </div>
  );
}
