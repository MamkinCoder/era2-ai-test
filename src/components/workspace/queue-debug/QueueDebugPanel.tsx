import { useQueue } from "@/features/generation-queue";
import type { QueueTask } from "@/entities/generation-task";

const STATUS_COLOR: Record<string, string> = {
  queued: "#888",
  running: "#3b82f6",
  done: "#22c55e",
  failed: "#ef4444",
  cancelled: "#f59e0b",
};

function TaskRow({ task, onCancel, onRetry }: {
  task: QueueTask;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
}) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 0",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      fontSize: 12,
    }}>
      <span style={{
        width: 70,
        color: STATUS_COLOR[task.status],
        fontWeight: 600,
        textTransform: "uppercase",
        flexShrink: 0,
      }}>
        {task.status}
      </span>

      <span style={{ width: 52, color: "#a78bfa", flexShrink: 0 }}>
        {task.type}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#e2e8f0" }}>
          {task.prompt}
        </div>
        {task.errorMessage && (
          <div style={{ color: "#fca5a5", fontSize: 11, marginTop: 2 }}>{task.errorMessage}</div>
        )}
      </div>

      <div style={{ width: 120, flexShrink: 0 }}>
        <div style={{
          background: "rgba(255,255,255,0.1)",
          borderRadius: 4,
          height: 6,
          overflow: "hidden",
        }}>
          <div style={{
            width: `${task.progress}%`,
            height: "100%",
            background: STATUS_COLOR[task.status],
            transition: "width 0.4s ease",
          }} />
        </div>
        <span style={{ color: "#94a3b8", fontSize: 10, marginTop: 2, display: "block" }}>
          {Math.round(task.progress)}% · retry#{task.retryCount}
        </span>
      </div>

      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
        {(task.status === "running" || task.status === "queued") && (
          <button
            onClick={() => onCancel(task.id)}
            style={btnStyle("#ef4444")}
          >
            cancel
          </button>
        )}
        {task.status === "failed" && (
          <button
            onClick={() => onRetry(task.id)}
            style={btnStyle("#3b82f6")}
          >
            retry
          </button>
        )}
      </div>
    </div>
  );
}

function btnStyle(color: string): React.CSSProperties {
  return {
    background: "transparent",
    border: `1px solid ${color}`,
    color,
    borderRadius: 4,
    padding: "2px 8px",
    cursor: "pointer",
    fontSize: 11,
  };
}

export function QueueDebugPanel() {
  const { tasks, cancel, retry, clearCompleted, addTask } = useQueue();

  const counts = {
    running: tasks.filter((t) => t.status === "running").length,
    queued: tasks.filter((t) => t.status === "queued").length,
    done: tasks.filter((t) => t.status === "done").length,
    failed: tasks.filter((t) => t.status === "failed").length,
    cancelled: tasks.filter((t) => t.status === "cancelled").length,
  };

  const sorted = [...tasks].sort((a, b) => {
    const order = { running: 0, queued: 1, failed: 2, done: 3, cancelled: 4 };
    return (order[a.status as keyof typeof order] ?? 9) - (order[b.status as keyof typeof order] ?? 9)
      || a.createdAt - b.createdAt;
  });

  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      right: 20,
      width: 640,
      maxHeight: "80vh",
      background: "#0f172a",
      border: "1px solid #334155",
      borderRadius: 10,
      padding: 16,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      fontFamily: "monospace",
      color: "#e2e8f0",
      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: "#a78bfa" }}>
          QUEUE DEBUG
        </span>
        <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
          <Stat label="running" value={counts.running} color="#3b82f6" />
          <Stat label="queued" value={counts.queued} color="#888" />
          <Stat label="done" value={counts.done} color="#22c55e" />
          <Stat label="failed" value={counts.failed} color="#ef4444" />
          <Stat label="cancelled" value={counts.cancelled} color="#f59e0b" />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => clearCompleted()}
          style={btnStyle("#94a3b8")}
        >
          clear completed
        </button>
        <button
          onClick={() => addTask("image", "Quick test image " + Date.now())}
          style={btnStyle("#a78bfa")}
        >
          + add image task
        </button>
        <button
          onClick={() => addTask("text", "Quick test text " + Date.now())}
          style={btnStyle("#a78bfa")}
        >
          + add text task
        </button>
      </div>

      <div style={{ overflowY: "auto", flex: 1 }}>
        {sorted.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onCancel={cancel}
            onRetry={retry}
          />
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span>
      <span style={{ color }}>{value}</span>
      <span style={{ color: "#64748b" }}> {label}</span>
    </span>
  );
}
