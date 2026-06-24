import { useState, useRef, useEffect } from "react";
import { X, Download, RotateCcw, MoreHorizontal } from "lucide-react";
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
  icon: Icon,
  accent,
  large,
}: {
  onClick: () => void;
  title: string;
  icon: React.ElementType;
  accent?: boolean;
  large?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex items-center justify-center bg-[var(--c-bg-2)] rounded-[8px] border border-[#2d2420] transition-opacity hover:opacity-70 ${
        large ? "h-[34px] w-[34px]" : "h-8 w-8"
      } ${accent ? "text-[var(--c-accent-2)]" : "text-[var(--c-fg-mute)]"}`}
    >
      <Icon size={14} strokeWidth={2} />
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
        className="flex h-8 w-8 items-center justify-center bg-[var(--c-bg-2)] rounded-[8px] border border-[#2d2420] text-[var(--c-fg-mute)] transition-opacity hover:opacity-70"
      >
        <MoreHorizontal size={14} strokeWidth={2} />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-20 min-w-[140px] rounded-[10px] bg-[var(--c-bg-2)] border border-[#2d2420] shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden">
          <button
            onClick={() => { onDelete(taskId); setOpen(false); }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-[#FF6B6B] hover:bg-[var(--c-bg-3)] transition-colors"
          >
            <X size={13} />
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
        <ActionBtn onClick={() => onCancel(taskId)} title="Отменить" icon={X} large={large} />
      )}
      {status === "done" && (
        <ActionBtn onClick={() => {}} title="Скачать" icon={Download} accent large={large} />
      )}
      {(status === "failed" || status === "cancelled") && (
        <ActionBtn onClick={() => onRetry(taskId)} title="Повторить" icon={RotateCcw} accent large={large} />
      )}
      <MoreMenu taskId={taskId} onDelete={onDelete} />
    </div>
  );
}
