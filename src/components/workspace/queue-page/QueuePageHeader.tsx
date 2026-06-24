import { useState, useEffect, useRef } from "react";

export interface QueuePageHeaderProps {
  onClearCompleted: () => void;
  canClearCompleted: boolean;
}

const UNDO_DELAY_MS = 5000;

export function QueuePageHeader({ onClearCompleted, canClearCompleted }: QueuePageHeaderProps) {
  const [undoActive, setUndoActive] = useState(false);
  const [remaining, setRemaining] = useState(UNDO_DELAY_MS / 1000);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  function clearTimers() {
    if (commitTimer.current) { clearTimeout(commitTimer.current); commitTimer.current = null; }
    if (tickTimer.current) { clearInterval(tickTimer.current); tickTimer.current = null; }
  }

  function handleClear() {
    if (undoActive) return;
    setUndoActive(true);
    setRemaining(UNDO_DELAY_MS / 1000);

    commitTimer.current = setTimeout(() => {
      onClearCompleted();
      setUndoActive(false);
    }, UNDO_DELAY_MS);

    tickTimer.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { clearInterval(tickTimer.current!); tickTimer.current = null; return 0; }
        return r - 1;
      });
    }, 1000);
  }

  function handleUndo() {
    clearTimers();
    setUndoActive(false);
  }

  useEffect(() => clearTimers, []);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-[30px] font-bold leading-[1.3] text-[var(--c-fg)]">
          Очередь генераций
        </h1>
        <p className="mt-1 text-[15px] text-[var(--c-fg-mute)]">
          Все ваши задачи в реальном времени
        </p>
      </div>

      <div className="flex items-center gap-3 self-start md:self-auto">
        {undoActive ? (
          <div className="flex items-center gap-3 h-10 px-4 rounded-full bg-[var(--c-bg-2)] border border-[#2d2420] text-[13px]">
            <span className="text-[var(--c-fg-mute)]">Готовые удалятся через {remaining}с</span>
            <button
              onClick={handleUndo}
              className="text-[var(--c-accent-2)] font-medium hover:opacity-80 transition-opacity"
            >
              Отменить
            </button>
          </div>
        ) : (
          <button
            onClick={handleClear}
            disabled={!canClearCompleted}
            className="h-10 px-4 text-[14px] font-medium text-[var(--c-fg-dim)] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Очистить готовые
          </button>
        )}
      </div>
    </div>
  );
}
