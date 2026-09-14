import { BatteryWarning, Radio } from "lucide-react";
import type { Node } from "../../types";

interface NodeHealthSummaryProps {
  nodes: Node[];
}

export function NodeHealthSummary({ nodes }: NodeHealthSummaryProps) {
  const online = nodes.filter((n) => n.connected).length;
  const total = nodes.length;
  const lowBattery = nodes.filter((n) => n.batteryLevel < 25).length;
  const pct = total === 0 ? 100 : Math.round((online / total) * 100);

  return (
    <section className="card p-5" aria-label="Node network health">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="eyebrow">Mesh Health</p>
          <h2 className="mt-0.5 font-heading text-base font-semibold text-ink">Node Network</h2>
        </div>
        <Radio size={16} className="text-status-low" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-heading text-3xl font-semibold text-ink">
          {online}/{total}
        </span>
        <span className="text-sm text-ink-muted">nodes online</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-bg">
        <div
          className="h-full rounded-full bg-status-low transition-[width]"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Percentage of nodes online"
        />
      </div>
      {lowBattery > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-status-high">
          <BatteryWarning size={14} />
          {lowBattery} node{lowBattery === 1 ? "" : "s"} low on battery
        </p>
      )}
    </section>
  );
}
