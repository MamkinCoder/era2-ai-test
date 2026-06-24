import { useEffect } from "react";
import { QueuePageContent } from "@/components/workspace/queue-page";

export default function QueuePage() {
  useEffect(() => {
    document.title = "Очередь — ERA2";
  }, []);

  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      <div className="mx-auto w-full max-w-[1120px] px-4 py-10">
        <QueuePageContent />
      </div>
    </main>
  );
}
