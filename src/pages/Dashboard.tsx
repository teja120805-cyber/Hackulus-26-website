import { useSimulationStore } from "../lib/simulationStore";
import { VenueMap } from "../components/dashboard/VenueMap";
import { AlertFeed } from "../components/dashboard/AlertFeed";
import { NodeHealthSummary } from "../components/dashboard/NodeHealthSummary";
import { StatusBadge } from "../components/StatusBadge";

export function Dashboard() {
  const zones = useSimulationStore((s) => s.zones);
  const nodes = useSimulationStore((s) => s.nodes);
  const alerts = useSimulationStore((s) => s.alerts);

  const urgentZones = zones.filter((z) => z.status === "critical" || z.status === "emergency");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Live Dashboard</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Real-time crowd density across all zones. Click a zone for detail.
        </p>
      </div>

      {urgentZones.length > 0 && (
        <div className="flex flex-wrap gap-2" role="status">
          {urgentZones.map((z) => (
            <div
              key={z.id}
              className="flex items-center gap-2 rounded-lg border border-status-critical bg-status-critical-bg px-3 py-2 text-sm text-ink"
            >
              <StatusBadge status={z.status} size="sm" pulse />
              <span className="font-medium">{z.name}</span> needs attention
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <VenueMap zones={zones} />
        <div className="flex flex-col gap-6">
          <NodeHealthSummary nodes={nodes} />
          <AlertFeed alerts={alerts} limit={8} />
        </div>
      </div>
    </div>
  );
}
