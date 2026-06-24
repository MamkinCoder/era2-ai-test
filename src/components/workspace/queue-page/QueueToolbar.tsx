import { QueueStatusTabs } from "./QueueStatusTabs";
import { QueueSortSelect } from "./QueueSortSelect";
import type { QueueStatusFilter, QueueSortMode } from "./queue-page.types";

export interface QueueToolbarProps {
  status: QueueStatusFilter;
  sort: QueueSortMode;
  onStatusChange: (status: QueueStatusFilter) => void;
  onSortChange: (sort: QueueSortMode) => void;
}

export function QueueToolbar({ status, sort, onStatusChange, onSortChange }: QueueToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <QueueStatusTabs value={status} onChange={onStatusChange} />
      <QueueSortSelect value={sort} onChange={onSortChange} />
    </div>
  );
}
