import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useQueue } from "@/entities/generation/model/queue-context";
import { useNavigate, useLocation } from "@/shared/routing";
import { GenerationQueueStatusPanel } from "./GenerationQueueStatusPanel";
import type { GenerationQueueStatusMode, GenerationQueueStatusTaskView } from "./generation-queue-status.types";

function SpinnerRing({ size = 16 }: { size?: number }) {
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

const CHAT_ROUTES = ["/text", "/design", "/video", "/audio"];

interface Props {
  mode?: GenerationQueueStatusMode;
  className?: string;
  /** Shifts pill left by (40px button + 12px gap) to avoid scroll-to-top button */
  rightShifted?: boolean;
  /** On pill click navigate to /queue instead of expanding (mobile inline pill) */
  navigateOnClick?: boolean;
  /** Extra routes where this instance should return null (used to avoid double-mount) */
  skipRoutes?: string[];
}

function toTaskView(task: {
  id: string;
  type: GenerationQueueStatusTaskView["type"];
  status: "queued" | "running";
  prompt: string;
  progress: number;
}): GenerationQueueStatusTaskView {
  return {
    id: task.id,
    type: task.type,
    status: task.status,
    prompt: task.prompt,
    modelName: task.type,
    progress: task.progress,
  };
}

function calcAggregateProgress(tasks: GenerationQueueStatusTaskView[]): number {
  if (tasks.length === 0) return 0;
  const total = tasks.reduce(
    (sum, t) => sum + (t.status === "queued" ? 0 : t.progress),
    0,
  );
  return Math.round(total / tasks.length);
}

function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

// Full-width bar used in mobile mode and mobile inline-trigger
function MobileBar({
  activeTasks,
  aggregateProgress,
  onClick,
  className,
}: {
  activeTasks: GenerationQueueStatusTaskView[];
  aggregateProgress: number;
  onClick: () => void;
  className?: string;
}) {
  const title = activeTasks.length === 1 ? "Генерация идёт" : "Генерации идут";
  const subtitle =
    activeTasks.length === 1
      ? `1 активна · ${Math.round(activeTasks[0].progress)}%`
      : `${activeTasks.length} активны · ${aggregateProgress}%`;

  return (
    <div
      className={`bg-[var(--c-bg-2)] border rounded-[10px] overflow-hidden cursor-pointer shadow-[0_6px_18px_rgba(0,0,0,0.4)] ${className ?? ""}`}
      onClick={onClick}
    >
      {/* Content row */}
      <div className="flex items-center gap-2.5 px-3 h-[53px]">
        <SpinnerRing size={18} />
        <div className="flex-1 min-w-0">
          <p className="m-0 text-[13px] font-semibold text-[var(--c-fg)] leading-[1.3]">
            {title}
          </p>
          <p className="m-0 mt-px font-mono text-[11px] text-[var(--c-fg-mute)] leading-[1.4]">
            {subtitle}
          </p>
        </div>
        <span className="text-[15px] text-[var(--c-accent-2)] shrink-0">→</span>
      </div>

      {/* Progress bar strip at bottom */}
      <div className="h-[3px] bg-[var(--c-bg-3)]">
        <motion.div
          className="h-full bg-[linear-gradient(90deg,var(--c-accent),var(--c-accent-2))]"
          animate={{ width: `${aggregateProgress}%` }}
          transition={{ duration: 0.4, ease: "linear" }}
        />
      </div>
    </div>
  );
}

export function GenerationQueueStatusBar({
  mode = "global",
  className,
  rightShifted = false,
  navigateOnClick = false,
  skipRoutes = [],
}: Props) {
  const { tasks } = useQueue();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  if (mode === "global" && matchesRoute(location.pathname, CHAT_ROUTES)) return null;
  if (mode === "mobile" && matchesRoute(location.pathname, CHAT_ROUTES)) return null;
  if (skipRoutes.length > 0 && matchesRoute(location.pathname, skipRoutes)) return null;

  const activeTasks = tasks
    .filter((t): t is typeof t & { status: "queued" | "running" } =>
      t.status === "queued" || t.status === "running",
    )
    .map(toTaskView);

  if (activeTasks.length === 0) return null;

  const aggregateProgress = calcAggregateProgress(activeTasks);

  const handleOpenQueue = () => {
    setExpanded(false);
    navigate("/queue");
  };

  const handlePillClick = () => {
    if (navigateOnClick) {
      navigate("/queue");
    } else {
      setExpanded((v) => !v);
    }
  };

  // ── Collapsed pill ────────────────────────────────────────────────────────
  const countLabel =
    activeTasks.length === 1 ? "1 генерация" : `${activeTasks.length} генерации`;

  const pill = (
    <button
      onClick={handlePillClick}
      className="flex items-center gap-2 h-[37px] pl-[10px] pr-3 rounded-full bg-[var(--c-bg-2)] border cursor-pointer whitespace-nowrap shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
    >
      <SpinnerRing size={16} />
      <span className="text-[13px] font-medium text-[var(--c-fg)]">
        {countLabel}
      </span>
      <span className="font-mono text-[13px] font-medium text-[var(--c-accent-2)] tabular-nums">
        · {aggregateProgress}%
      </span>
    </button>
  );

  // ── Expanded panel portal ─────────────────────────────────────────────────
  const expandedPanel = createPortal(
    <AnimatePresence>
      {expanded && (
        <motion.div
          key="panel"
          className="fixed bottom-6 right-6 z-50"
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.15 }}
        >
          <GenerationQueueStatusPanel
            tasks={activeTasks}
            aggregateProgress={aggregateProgress}
            onOpenQueue={handleOpenQueue}
            onClose={() => setExpanded(false)}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );

  // ── Mobile mode ───────────────────────────────────────────────────────────
  if (mode === "mobile") {
    return createPortal(
      <div className="md:hidden fixed bottom-[calc(env(safe-area-inset-bottom,0px)+12px)] inset-x-3 z-50">
        <MobileBar
          activeTasks={activeTasks}
          aggregateProgress={aggregateProgress}
          onClick={handleOpenQueue}
        />
      </div>,
      document.body,
    );
  }

  // ── Inline-trigger mode ───────────────────────────────────────────────────
  if (mode === "inline-trigger") {
    // Mobile: full-width bar navigates directly
    if (navigateOnClick) {
      return (
        <MobileBar
          activeTasks={activeTasks}
          aggregateProgress={aggregateProgress}
          onClick={handlePillClick}
          className={className}
        />
      );
    }

    // Desktop: small pill, expands to portal panel
    return (
      <>
        <div className={className}>
          <AnimatePresence>
            {!expanded && (
              <motion.div
                key="pill"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                {pill}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {expandedPanel}
      </>
    );
  }

  // ── Global mode ───────────────────────────────────────────────────────────
  // initial.right matches animate.right so position doesn't animate on first mount.
  // When rightShifted changes while the pill is visible, the spring runs.
  const pillRight = rightShifted ? 76 : 24;
  return createPortal(
    <>
      <AnimatePresence>
        {!expanded && (
          <motion.div
            key="pill"
            className="hidden md:block fixed bottom-6 z-50"
            initial={{ opacity: 0, scale: 0.9, right: pillRight }}
            animate={{ opacity: 1, scale: 1, right: pillRight }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              opacity: { duration: 0.15 },
              scale: { duration: 0.15 },
              right: { type: "spring", stiffness: 300, damping: 30 },
            }}
          >
            {pill}
          </motion.div>
        )}
      </AnimatePresence>
      {expandedPanel}
    </>,
    document.body,
  );
}
