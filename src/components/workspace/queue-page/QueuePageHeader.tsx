export interface QueuePageHeaderProps {
  onClearCompleted: () => void;
  canClearCompleted: boolean;
}

export function QueuePageHeader({ onClearCompleted, canClearCompleted }: QueuePageHeaderProps) {
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
      <button
        onClick={onClearCompleted}
        disabled={!canClearCompleted}
        className="h-10 px-4 text-[14px] font-medium text-[var(--c-fg-dim)] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
      >
        Очистить готовые
      </button>
    </div>
  );
}
