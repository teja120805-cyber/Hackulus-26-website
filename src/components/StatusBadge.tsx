import type { ZoneStatus } from "../types";
import { STATUS_LABEL } from "../types";
import { STATUS_BG, STATUS_COLOR } from "../lib/status";

const STATUS_ICON: Record<ZoneStatus, string> = {
  low: "●",
  moderate: "▲",
  high: "▲",
  critical: "⬥",
  emergency: "✕",
};

interface StatusBadgeProps {
  status: ZoneStatus;
  size?: "sm" | "md";
  pulse?: boolean;
}

export function StatusBadge({ status, size = "md", pulse = false }: StatusBadgeProps) {
  const isUrgent = status === "critical" || status === "emergency";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
      style={{ background: STATUS_BG[status], color: STATUS_COLOR[status] }}
    >
      <span aria-hidden="true" className={pulse && isUrgent ? "status-pulse" : undefined}>
        {STATUS_ICON[status]}
      </span>
      {STATUS_LABEL[status]}
    </span>
  );
}
