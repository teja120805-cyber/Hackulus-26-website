import type { AlertEvent } from "../../types";

interface AlertFeedProps {
  alerts: AlertEvent[];
  title?: string;
  emptyLabel?: string;
  limit?: number;
}

const SEVERITY_STYLE: Record<AlertEvent["severity"], string> = {
  info: "border-status-low bg-status-low-bg text-ink",
  warning: "border-status-moderate bg-status-moderate-bg text-ink",
  critical: "border-status-critical bg-status-critical-bg text-ink",
};

const SEVERITY_ICON: Record<AlertEvent["severity"], string> = {
  info: "ℹ",
  warning: "▲",
  critical: "✕",
};

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function AlertFeed({ alerts, title = "Live Alerts", emptyLabel = "No alerts yet.", limit }: AlertFeedProps) {
  const shown = limit ? alerts.slice(0, limit) : alerts;
  return (
    <section className="rounded-xl border border-border bg-surface p-4" aria-label={title}>
      <h2 className="mb-3 text-sm font-semibold text-ink">{title}</h2>
      {shown.length === 0 ? (
        <p className="text-sm text-ink-muted">{emptyLabel}</p>
      ) : (
        <ul className="flex max-h-[26rem] flex-col gap-2 overflow-y-auto">
          {shown.map((alert) => (
            <li
              key={alert.id}
              className={`flex items-start gap-2 rounded-md border-l-4 px-3 py-2 text-sm ${SEVERITY_STYLE[alert.severity]}`}
            >
              <span aria-hidden="true" className="mt-0.5">
                {SEVERITY_ICON[alert.severity]}
              </span>
              <div className="flex-1">
                <p className="leading-snug">{alert.message}</p>
                <time className="text-xs text-ink-muted">{formatTime(alert.timestamp)}</time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
