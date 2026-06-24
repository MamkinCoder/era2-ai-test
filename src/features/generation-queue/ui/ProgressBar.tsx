import { motion } from "framer-motion";

export function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="h-[5px] w-full overflow-hidden rounded-full bg-[var(--c-bg-3)]">
      <motion.div
        className="h-full rounded-full bg-[linear-gradient(135deg,var(--c-accent),var(--c-accent-2))]"
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.4, ease: "linear" }}
      />
    </div>
  );
}
