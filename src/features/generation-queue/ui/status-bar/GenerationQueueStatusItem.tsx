import { motion } from "framer-motion";
import type { GenerationQueueStatusTaskView } from "./generation-queue-status.types";

function Thumbnail({ status }: { status: "queued" | "running" }) {
  return (
    <div className="w-7 h-7 shrink-0 rounded-[6px] bg-[linear-gradient(135deg,var(--c-accent-soft),var(--c-bg-2))] flex items-center justify-center">
      <span className="text-[11px] text-[var(--c-accent-2)] leading-none select-none">
        {status === "running" ? "◐" : "▷"}
      </span>
    </div>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="h-1 rounded-sm bg-[var(--c-bg-3)] overflow-hidden">
      <motion.div
        className="h-full rounded-sm bg-[linear-gradient(90deg,var(--c-accent),var(--c-accent-2))]"
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.4, ease: "linear" }}
      />
    </div>
  );
}

interface Props {
  task: GenerationQueueStatusTaskView;
}

export function GenerationQueueStatusItem({ task }: Props) {
  const isQueued = task.status === "queued";

  return (
    <div className="flex items-center gap-2.5">
      <Thumbnail status={task.status} />

      <div className="flex-1 min-w-0 flex flex-col gap-[5px]">
        <p className="m-0 text-xs text-[var(--c-fg-dim)] truncate leading-[1.3]">
          {task.prompt}
        </p>
        <ProgressBar progress={isQueued ? 0 : task.progress} />
      </div>

      <span className={`font-mono text-[11px] font-medium tabular-nums shrink-0 min-w-[44px] text-right ${isQueued ? "text-[var(--c-fg-mute)]" : "text-[var(--c-accent-2)]"}`}>
        {isQueued ? "в очереди" : `${Math.round(task.progress)}%`}
      </span>
    </div>
  );
}
