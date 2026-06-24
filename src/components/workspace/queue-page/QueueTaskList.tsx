import { AnimatePresence, motion } from "framer-motion";
import { QueueTaskCard } from "./QueueTaskCard";
import type { QueueTaskViewModel } from "./queue-page.types";

export interface QueueTaskListProps {
  tasks: QueueTaskViewModel[];
  onCancel: (taskId: string) => void;
  onRetry: (taskId: string) => void;
}

const taskVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export function QueueTaskList({ tasks, onCancel, onRetry }: QueueTaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-[var(--c-line)] py-16 text-center">
        <span className="text-2xl">◌</span>
        <p className="text-sm text-[var(--c-fg-mute)]">Нет задач</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[10px]">
      <AnimatePresence initial={false}>
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            layout
            variants={taskVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.18 }}
          >
            <QueueTaskCard task={task} onCancel={onCancel} onRetry={onRetry} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
