import { useState, useRef, useEffect } from "react";
import type { QueueStatus } from "@/entities/generation-task";

export interface TaskActionsProps {
  taskId: string;
  status: QueueStatus;
  onCancel: (taskId: string) => void;
  onRetry: (taskId: string) => void;
  onDelete: (taskId: string) => void;
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

function MoreMenu({ taskId, onDelete }: { taskId: string; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Ещё"
        className="flex h-8 w-8 items-center justify-center bg-[var(--c-bg-2)] rounded-[8px] border border-[#2d2420] text-[14px] text-[var(--c-fg-mute)] transition-opacity hover:opacity-70"
      >
        ⋯
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-20 min-w-[140px] rounded-[10px] bg-[var(--c-bg-2)] border border-[#2d2420] shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden">
          <button
            onClick={() => { onDelete(taskId); setOpen(false); }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-[#FF6B6B] hover:bg-[var(--c-bg-3)] transition-colors"
          >
            <span>✕</span>
            Удалить
          </button>
        </div>
      )}
    </div>
  );
}

export function TaskActions({ taskId, status, onCancel, onRetry, onDelete, large }: TaskActionsProps) {
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
      <MoreMenu taskId={taskId} onDelete={onDelete} />
    </div>
  );
}
