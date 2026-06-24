export function LoadingState() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-[68px] rounded-[16px] bg-[var(--c-bg-2)] animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] md:gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[82px] md:h-[94px] rounded-[16px] bg-[var(--c-bg-2)] animate-pulse" />
        ))}
      </div>
      <div className="flex flex-col gap-[10px]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-[88px] rounded-[16px] bg-[var(--c-bg-2)] animate-pulse"
            style={{ opacity: 1 - i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}
