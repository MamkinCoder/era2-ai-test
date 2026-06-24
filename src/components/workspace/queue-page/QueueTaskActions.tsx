import type { QueueTaskStatus } from "./queue-page.types";

export interface QueueTaskActionsProps {
  taskId: string;
  status: QueueTaskStatus;
  onCancel: (taskId: string) => void;
  onRetry: (taskId: string) => void;
  /** 34×34 buttons (mobile). Default: 32×32 */
  large?: boolean;
}

function ActionBtn({
  onClick,
  title,
  char,
  accent,
  large,
}: {
  onClick: () => void;
  title: string;
  char: string;
  accent?: boolean;
  large?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex items-center justify-center bg-[var(--c-bg-2)] rounded-[8px] border border-[#2d2420] text-[14px] transition-opacity hover:opacity-70 ${
        large ? "h-[34px] w-[34px]" : "h-8 w-8"
      } ${accent ? "text-[var(--c-accent-2)]" : "text-[var(--c-fg-mute)]"}`}
    >
      {char}
    </button>
  );
}

export function QueueTaskActions({ taskId, status, onCancel, onRetry, large }: QueueTaskActionsProps) {
  return (
    <div className="flex items-center gap-1.5">
      {(status === "queued" || status === "running") && (
        <ActionBtn onClick={() => onCancel(taskId)} title="Отменить" char="✕" large={large} />
      )}
      {status === "done" && (
        <ActionBtn onClick={() => {}} title="Скачать" char="⤓" accent large={large} />
      )}
      {(status === "failed" || status === "cancelled") && (
        <ActionBtn onClick={() => onRetry(taskId)} title="Повторить" char="↻" accent large={large} />
      )}
      <ActionBtn onClick={() => {}} title="Ещё" char="⋯" large={large} />
    </div>
  );
}
