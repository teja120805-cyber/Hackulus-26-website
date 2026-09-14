import { useSimulationStore } from "../lib/simulationStore";

export function Settings() {
  const zones = useSimulationStore((s) => s.zones);
  const wearables = useSimulationStore((s) => s.wearables);
  const renameZone = useSimulationStore((s) => s.renameZone);
  const repositionZone = useSimulationStore((s) => s.repositionZone);
  const updateZoneThreshold = useSimulationStore((s) => s.updateZoneThreshold);
  const updateWearableSafeDistance = useSimulationStore((s) => s.updateWearableSafeDistance);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Configure per-zone capacity thresholds, wearable safe distances, and venue map positions.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold text-ink">Zones</h2>
        <div className="flex flex-col divide-y divide-border">
          {zones.map((zone) => (
            <div key={zone.id} className="grid grid-cols-1 gap-3 py-3 sm:grid-cols-[1fr_1fr_1fr_1fr] sm:items-center">
              <div>
                <label htmlFor={`name-${zone.id}`} className="text-xs text-ink-muted">
                  Name
                </label>
                <input
                  id={`name-${zone.id}`}
                  type="text"
                  value={zone.name}
                  onChange={(e) => renameZone(zone.id, e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-ink focus-visible:outline-2 focus-visible:outline-accent"
                />
              </div>
              <div>
                <label htmlFor={`threshold-${zone.id}`} className="text-xs text-ink-muted">
                  Capacity Threshold
                </label>
                <input
                  id={`threshold-${zone.id}`}
                  type="number"
                  min={10}
                  max={200}
                  value={zone.capacityThreshold}
                  onChange={(e) => updateZoneThreshold(zone.id, Number(e.target.value))}
                  className="mt-1 w-full rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-ink focus-visible:outline-2 focus-visible:outline-accent"
                />
              </div>
              <div>
                <label htmlFor={`x-${zone.id}`} className="text-xs text-ink-muted">
                  Map X (0-1)
                </label>
                <input
                  id={`x-${zone.id}`}
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={zone.position.x}
                  onChange={(e) => repositionZone(zone.id, { ...zone.position, x: Number(e.target.value) })}
                  className="mt-1 w-full rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-ink focus-visible:outline-2 focus-visible:outline-accent"
                />
              </div>
              <div>
                <label htmlFor={`y-${zone.id}`} className="text-xs text-ink-muted">
                  Map Y (0-1)
                </label>
                <input
                  id={`y-${zone.id}`}
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={zone.position.y}
                  onChange={(e) => repositionZone(zone.id, { ...zone.position, y: Number(e.target.value) })}
                  className="mt-1 w-full rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-ink focus-visible:outline-2 focus-visible:outline-accent"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold text-ink">Wearable Safe Distances</h2>
        <div className="flex flex-col divide-y divide-border">
          {wearables.map((w) => (
            <div key={w.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{w.childName}</p>
                <p className="text-xs text-ink-muted">Guardian: {w.guardianName}</p>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor={`safe-${w.id}`} className="text-xs text-ink-muted">
                  Safe distance (m)
                </label>
                <input
                  id={`safe-${w.id}`}
                  type="number"
                  min={5}
                  max={100}
                  value={w.safeDistanceMeters}
                  onChange={(e) => updateWearableSafeDistance(w.id, Number(e.target.value))}
                  className="w-20 rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-ink focus-visible:outline-2 focus-visible:outline-accent"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
