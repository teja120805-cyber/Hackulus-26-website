import { CircleDot, Diamond, TriangleAlert, XCircle } from "lucide-react";
import type { ZoneStatus } from "../types";
import { STATUS_LABEL } from "../types";
import { STATUS_BG, STATUS_COLOR } from "../lib/status";

const STATUS_ICON: Record<ZoneStatus, typeof CircleDot> = {
  low: CircleDot,
  moderate: TriangleAlert,
  high: TriangleAlert,
  critical: Diamond,
  emergency: XCircle,
};

interface StatusBadgeProps {
  status: ZoneStatus;
  size?: "sm" | "md";
  pulse?: boolean;
}

export function StatusBadge({ status, size = "md", pulse = false }: StatusBadgeProps) {
  const isUrgent = status === "critical" || status === "emergency";
  const Icon = STATUS_ICON[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${
        size === "sm" ? "px-2.5 py-1 text-sm" : "px-3.5 py-1.5 text-base"
      }`}
      style={{ background: STATUS_BG[status], color: STATUS_COLOR[status] }}
    >
      <Icon size={size === "sm" ? 14 : 16} aria-hidden="true" className={pulse && isUrgent ? "status-pulse" : undefined} />
      {STATUS_LABEL[status]}
    </span>
  );
}
