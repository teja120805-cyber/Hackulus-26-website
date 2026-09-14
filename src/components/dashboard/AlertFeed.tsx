import { Info, TriangleAlert, XCircle } from "lucide-react";
import type { AlertEvent } from "../../types";

interface AlertFeedProps {
  alerts: AlertEvent[];
  title?: string;
  emptyLabel?: string;
  limit?: number;
}

const SEVERITY_STYLE: Record<AlertEvent["severity"], string> = {
  info: "border-status-low bg-status-low-bg text-status-low",
  warning: "border-status-moderate bg-status-moderate-bg text-status-moderate",
  critical: "border-status-critical bg-status-critical-bg text-status-critical",
};

const SEVERITY_ICON: Record<AlertEvent["severity"], typeof Info> = {
  info: Info,
  warning: TriangleAlert,
  critical: XCircle,
};

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function AlertFeed({ alerts, title = "Live Alerts", emptyLabel = "No alerts yet.", limit }: AlertFeedProps) {
  const shown = limit ? alerts.slice(0, limit) : alerts;
  return (
    <section className="card p-5" aria-label={title}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="eyebrow">Live Feed</p>
          <h2 className="mt-0.5 font-heading text-lg font-semibold text-ink">{title}</h2>
        </div>
        <span className="flex items-center gap-1.5 font-mono text-xs text-status-low">
          <span className="h-1.5 w-1.5 rounded-full bg-status-low" aria-hidden="true" />
          Live
        </span>
      </div>
      {shown.length === 0 ? (
        <p className="text-base text-ink-muted">{emptyLabel}</p>
      ) : (
        <ul className="flex max-h-[26rem] flex-col gap-2 overflow-y-auto">
          {shown.map((alert) => {
            const Icon = SEVERITY_ICON[alert.severity];
            return (
              <li
                key={alert.id}
                className={`flex items-start gap-2.5 rounded-lg border-l-4 px-3.5 py-3 text-base transition-colors hover:brightness-[0.98] ${SEVERITY_STYLE[alert.severity]}`}
              >
                <Icon size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
                <div className="flex-1 text-ink">
                  <p className="leading-snug">{alert.message}</p>
                  <time className="text-sm text-ink-muted">{formatTime(alert.timestamp)}</time>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
