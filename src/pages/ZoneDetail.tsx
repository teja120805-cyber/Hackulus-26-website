import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useSimulationStore } from "../lib/simulationStore";
import { DensityChart } from "../components/zone/DensityChart";
import { StatusBadge } from "../components/StatusBadge";

export function ZoneDetail() {
  const { id } = useParams<{ id: string }>();
  const zones = useSimulationStore((s) => s.zones);
  const allNodes = useSimulationStore((s) => s.nodes);
  const updateZoneThreshold = useSimulationStore((s) => s.updateZoneThreshold);

  const zone = useMemo(() => zones.find((z) => z.id === id), [zones, id]);
  const nodes = useMemo(() => allNodes.filter((n) => n.zoneId === id), [allNodes, id]);

  if (!zone) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink-muted">Zone not found.</p>
        <Link to="/" className="text-accent underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link to="/" className="text-sm text-accent hover:underline">
          ← Dashboard
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-ink">{zone.name}</h1>
          <StatusBadge status={zone.status} pulse />
        </div>
        <p className="mt-1 text-sm text-ink-muted">
          Density {zone.densityScore} of {zone.capacityThreshold} threshold
        </p>
      </div>

      <DensityChart trend={zone.trend} capacityThreshold={zone.capacityThreshold} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold text-ink">Capacity Threshold</h2>
          <label htmlFor="threshold" className="text-xs text-ink-muted">
            Adjust the alert threshold for this zone
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              id="threshold"
              type="range"
              min={10}
              max={150}
              value={zone.capacityThreshold}
              onChange={(e) => updateZoneThreshold(zone.id, Number(e.target.value))}
              className="flex-1 accent-accent"
            />
            <span className="w-12 text-right text-sm font-medium text-ink">{zone.capacityThreshold}</span>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold text-ink">Nodes in this Zone</h2>
          {nodes.length === 0 ? (
            <p className="text-sm text-ink-muted">No nodes assigned.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {nodes.map((node) => (
                <li key={node.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                  <span className="font-medium text-ink">{node.id}</span>
                  <span className="flex items-center gap-2 text-ink-muted">
                    {node.connected ? (
                      <span className="text-status-low">● Connected</span>
                    ) : (
                      <span className="text-status-critical">✕ Offline {Math.round(node.lastSeenSeconds)}s</span>
                    )}
                    <span>{Math.round(node.batteryLevel)}% batt</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
