import { Battery, ChevronRight, Radio, TriangleAlert } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useSimulationStore } from "../lib/simulationStore";
import { DensityChart } from "../components/zone/DensityChart";
import { StatusBadge } from "../components/StatusBadge";

export function ZoneDetail() {
  const { id } = useParams<{ id: string }>();
  const zones = useSimulationStore((s) => s.zones);
  const allNodes = useSimulationStore((s) => s.nodes);
  const updateZoneThreshold = useSimulationStore((s) => s.updateZoneThreshold);

  const zone = zones.find((z) => z.id === id);
  const nodes = allNodes.filter((n) => n.zoneId === id);

  if (!zone) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-base text-ink-muted">Zone not found.</p>
        <Link to="/" className="btn-text w-fit">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const pctOfThreshold = Math.round((zone.densityScore / zone.capacityThreshold) * 100);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-1.5 text-sm text-ink-muted">
        <Link to="/" className="text-accent hover:underline">
          Overview
        </Link>
        <ChevronRight size={15} />
        <span>Zones</span>
        <ChevronRight size={15} />
        <b className="font-medium text-ink">{zone.name}</b>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-3xl font-semibold text-ink sm:text-4xl">{zone.name}</h1>
            <StatusBadge status={zone.status} pulse />
          </div>
          <p className="mt-1.5 text-base text-ink-muted">
            Zone ID {zone.id.toUpperCase()} · capacity threshold {zone.capacityThreshold}
          </p>
        </div>
        <div className="text-right">
          <span className="block text-sm text-ink-muted">Current density</span>
          <strong className="font-heading text-5xl font-semibold text-ink">
            {zone.densityScore}
            <small className="text-lg font-normal text-ink-muted">/100</small>
          </strong>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="eyebrow">Density Trend</p>
              <h2 className="mt-0.5 font-heading text-lg font-semibold text-ink">Recent readings</h2>
            </div>
            <span className="flex items-center gap-1.5 font-mono text-xs text-status-low">
              <span className="h-1.5 w-1.5 rounded-full bg-status-low" /> Live reading
            </span>
          </div>
          <DensityChart trend={zone.trend} capacityThreshold={zone.capacityThreshold} />
        </section>

        <section className="card p-5">
          <p className="eyebrow">Zone Configuration</p>
          <h2 className="mt-0.5 font-heading text-lg font-semibold text-ink">Capacity threshold</h2>
          <p className="mt-1 text-sm text-ink-muted">Alerts escalate once density passes this point.</p>
          <label htmlFor="threshold" className="mt-6 block text-sm text-ink-muted">
            Warning threshold
            <output className="float-right font-mono text-base font-semibold text-ink">
              {zone.capacityThreshold}
            </output>
          </label>
          <input
            id="threshold"
            type="range"
            min={10}
            max={150}
            value={zone.capacityThreshold}
            onChange={(e) => updateZoneThreshold(zone.id, Number(e.target.value))}
            className="mt-3 w-full accent-accent"
          />
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-[#efdfca] bg-[#fbf5eb] px-3.5 py-3 text-sm text-[#835b31]">
            <TriangleAlert size={18} className="shrink-0" />
            <span>
              Current reading is <b>{pctOfThreshold}%</b> of threshold
            </span>
          </div>
        </section>
      </div>

      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="eyebrow">Sensor Inputs</p>
            <h2 className="mt-0.5 font-heading text-lg font-semibold text-ink">Nodes in this zone</h2>
          </div>
          <span className="text-sm text-ink-muted">{nodes.length} assigned</span>
        </div>
        {nodes.length === 0 ? (
          <p className="text-base text-ink-muted">No nodes assigned.</p>
        ) : (
          <ul className="flex flex-col">
            {nodes.map((node) => (
              <li
                key={node.id}
                className="flex items-center gap-3 border-b border-[#efede7] py-3.5 text-base last:border-0"
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                    node.connected ? "bg-status-low-bg text-status-low" : "bg-status-critical-bg text-status-critical"
                  }`}
                >
                  <Radio size={17} />
                </span>
                <b className="font-mono text-sm text-ink">{node.id}</b>
                <span className="flex-1 text-sm text-ink-muted">
                  {node.connected ? "Connected" : `Offline ${Math.round(node.lastSeenSeconds)}s`}
                </span>
                <span className="flex items-center gap-1 text-sm text-ink-muted">
                  <Battery size={16} /> {Math.round(node.batteryLevel)}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
