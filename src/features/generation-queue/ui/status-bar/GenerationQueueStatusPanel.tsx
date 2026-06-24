import { motion } from "framer-motion";
import { GenerationQueueStatusItem } from "./GenerationQueueStatusItem";
import type { GenerationQueueStatusTaskView } from "./generation-queue-status.types";

function SpinnerRing({ size = 18 }: { size?: number }) {
  const r = (size - 3) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="animate-spin origin-center shrink-0"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--c-accent)"
        strokeWidth="2"
        strokeDasharray={`${c * 0.72} ${c * 0.28}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

function LargeThumbnail() {
  return (
    <div className="w-10 h-10 shrink-0 rounded-lg bg-[linear-gradient(135deg,var(--c-accent-soft),var(--c-bg-2))]" />
  );
}

const TYPE_LABELS: Record<string, string> = {
  image: "изображения",
  video: "видео",
  text: "текста",
  audio: "аудио",
  design: "дизайна",
};

interface Props {
  tasks: GenerationQueueStatusTaskView[];
  aggregateProgress: number;
  onOpenQueue: () => void;
  onClose: () => void;
}

const MAX_VISIBLE = 3;

export function GenerationQueueStatusPanel({ tasks, aggregateProgress, onOpenQueue, onClose }: Props) {
  const visible = tasks.slice(0, MAX_VISIBLE);
  const overflow = tasks.length - MAX_VISIBLE;

  const panelClass =
    "bg-[var(--c-bg-2)] border rounded-[14px] overflow-hidden " +
    "shadow-[0_16px_40px_rgba(0,0,0,0.55),0_0_0_1px_rgba(232,84,32,0.25),0_0_24px_rgba(232,84,32,0.12)]";

  if (tasks.length === 1) {
    const task = tasks[0];
    return (
      <div className={`${panelClass} w-[300px]`}>
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3.5">
          <SpinnerRing size={18} />
          <div className="flex-1 min-w-0">
            <p className="m-0 text-[13px] font-semibold text-[var(--c-fg)] leading-[1.3]">
              Генерация {TYPE_LABELS[task.type] ?? task.type}
            </p>
            <p className="m-0 mt-px font-mono text-[11px] text-[var(--c-fg-mute)] leading-[1.4]">
              {task.modelName} · {Math.round(task.progress)}%
            </p>
          </div>
          <button
            onClick={onOpenQueue}
            className="bg-transparent border-0 cursor-pointer text-sm text-[var(--c-fg-mute)] shrink-0 leading-none p-0"
          >
            →
          </button>
        </div>

        {/* Thumbnail + prompt + progress */}
        <div className="flex gap-3 px-4 pb-3 pt-3 border-t">
          <LargeThumbnail />
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <p className="m-0 text-xs text-[var(--c-fg-dim)] leading-[1.4]">
              {task.prompt}
            </p>
            <div className="h-1 rounded-sm bg-[var(--c-bg-3)] overflow-hidden">
              <motion.div
                className="h-full rounded-sm bg-[linear-gradient(90deg,var(--c-accent),var(--c-accent-2))]"
                animate={{ width: `${task.progress}%` }}
                transition={{ duration: 0.4, ease: "linear" }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${panelClass} w-[332px]`}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3.5">
        <SpinnerRing size={18} />
        <div className="flex-1">
          <p className="m-0 text-[13px] font-semibold text-[var(--c-fg)] leading-[1.3]">
            Генерации идут
          </p>
          <p className="m-0 mt-px font-mono text-[11px] text-[var(--c-fg-mute)] leading-[1.4]">
            {tasks.length} активны · {aggregateProgress}%
          </p>
        </div>
        <button
          onClick={onClose}
          className="bg-transparent border-0 cursor-pointer text-base text-[var(--c-fg-mute)] shrink-0 leading-none p-0"
          aria-label="Свернуть"
        >
          ⌄
        </button>
      </div>

      {/* Task rows */}
      <div className="flex flex-col gap-3 px-3.5 py-3 border-t">
        {visible.map((task) => (
          <GenerationQueueStatusItem key={task.id} task={task} />
        ))}
        {overflow > 0 && (
          <p className="m-0 text-[11px] text-[var(--c-fg-mute)]">+{overflow} ещё</p>
        )}
      </div>

      {/* Footer CTA */}
      <button
        onClick={onOpenQueue}
        className="flex w-full justify-center items-center gap-1 py-[11px] px-4 bg-transparent border-0 border-t cursor-pointer"
      >
        <span className="text-[13px] font-medium text-[var(--c-accent-2)]">Открыть очередь</span>
        <span className="text-[13px] text-[var(--c-accent-2)]">→</span>
      </button>
    </div>
  );
}
