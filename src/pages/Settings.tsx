import { Check } from "lucide-react";
import { useSimulationStore } from "../lib/simulationStore";
import { PageIntro } from "../components/PageIntro";

export function Settings() {
  const zones = useSimulationStore((s) => s.zones);
  const wearables = useSimulationStore((s) => s.wearables);
  const renameZone = useSimulationStore((s) => s.renameZone);
  const repositionZone = useSimulationStore((s) => s.repositionZone);
  const updateZoneThreshold = useSimulationStore((s) => s.updateZoneThreshold);
  const updateWearableSafeDistance = useSimulationStore((s) => s.updateWearableSafeDistance);

  const inputClasses =
    "mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-base text-ink transition-colors hover:border-[#c9b69d] focus-visible:outline-2 focus-visible:outline-accent";

  return (
    <div className="flex flex-col gap-6">
      <PageIntro
        eyebrow="Event Configuration"
        title="Make it yours."
        description="Tune your safety thresholds and venue layout."
        compact
        action={
          <span className="flex items-center gap-1.5 text-sm text-status-low">
            <Check size={16} /> All changes saved locally
          </span>
        }
      />

      <section className="card p-5">
        <p className="eyebrow">Zone Thresholds</p>
        <h2 className="mt-0.5 mb-3 font-heading text-lg font-semibold text-ink">Zones</h2>
        <div className="flex flex-col divide-y divide-border">
          {zones.map((zone) => (
            <div key={zone.id} className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-[1fr_1fr_1fr_1fr] sm:items-center">
              <div>
                <label htmlFor={`name-${zone.id}`} className="text-sm text-ink-muted">
                  Name
                </label>
                <input
                  id={`name-${zone.id}`}
                  type="text"
                  value={zone.name}
                  onChange={(e) => renameZone(zone.id, e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor={`threshold-${zone.id}`} className="text-sm text-ink-muted">
                  Capacity Threshold
                </label>
                <input
                  id={`threshold-${zone.id}`}
                  type="number"
                  min={10}
                  max={200}
                  value={zone.capacityThreshold}
                  onChange={(e) => updateZoneThreshold(zone.id, Number(e.target.value))}
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor={`lat-${zone.id}`} className="text-sm text-ink-muted">
                  Latitude
                </label>
                <input
                  id={`lat-${zone.id}`}
                  type="number"
                  step={0.0001}
                  value={zone.position.lat}
                  onChange={(e) => repositionZone(zone.id, { ...zone.position, lat: Number(e.target.value) })}
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor={`lng-${zone.id}`} className="text-sm text-ink-muted">
                  Longitude
                </label>
                <input
                  id={`lng-${zone.id}`}
                  type="number"
                  step={0.0001}
                  value={zone.position.lng}
                  onChange={(e) => repositionZone(zone.id, { ...zone.position, lng: Number(e.target.value) })}
                  className={inputClasses}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <p className="eyebrow">Wearables</p>
        <h2 className="mt-0.5 mb-3 font-heading text-lg font-semibold text-ink">Safe distances</h2>
        <div className="flex flex-col divide-y divide-border">
          {wearables.map((w) => (
            <div key={w.id} className="flex items-center justify-between gap-3 py-4">
              <div>
                <p className="text-base font-medium text-ink">{w.childName}</p>
                <p className="text-sm text-ink-muted">Guardian: {w.guardianName}</p>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor={`safe-${w.id}`} className="text-sm text-ink-muted">
                  Safe distance (m)
                </label>
                <input
                  id={`safe-${w.id}`}
                  type="number"
                  min={5}
                  max={100}
                  value={w.safeDistanceMeters}
                  onChange={(e) => updateWearableSafeDistance(w.id, Number(e.target.value))}
                  className={`w-24 ${inputClasses}`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
