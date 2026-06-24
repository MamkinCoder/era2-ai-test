import { AlertTriangle } from "lucide-react";

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <AlertTriangle size={36} className="text-[var(--c-fg-mute)]" />
      <p className="text-[15px] font-medium text-[var(--c-fg)]">Не удалось загрузить очередь</p>
      <p className="text-[13px] text-[var(--c-fg-mute)]">Проверьте соединение и попробуйте снова</p>
      <button
        onClick={onRetry}
        className="mt-2 h-[38px] px-5 rounded-full bg-[var(--c-accent)] text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
      >
        Повторить
      </button>
    </div>
  );
}
