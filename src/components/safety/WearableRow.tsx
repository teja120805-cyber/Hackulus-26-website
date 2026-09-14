import { Check, Siren, TriangleAlert } from "lucide-react";
import type { Wearable } from "../../types";
import { useSimulationStore } from "../../lib/simulationStore";

interface WearableRowProps {
  wearable: Wearable;
}

const STATUS_META: Record<Wearable["status"], { label: string; icon: typeof Check; classes: string }> = {
  safe: { label: "Safe", icon: Check, classes: "bg-status-low-bg text-status-low" },
  separated: { label: "Separated", icon: TriangleAlert, classes: "bg-status-moderate-bg text-status-moderate" },
  sos: { label: "SOS", icon: Siren, classes: "bg-status-critical-bg text-status-critical" },
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function WearableRow({ wearable }: WearableRowProps) {
  const resolveWearable = useSimulationStore((s) => s.resolveWearable);
  const meta = STATUS_META[wearable.status];
  const Icon = meta.icon;
  const urgent = wearable.status !== "safe";
  const overBy = wearable.distanceMeters - wearable.safeDistanceMeters;
  const meterPct = Math.min(100, (wearable.distanceMeters / wearable.safeDistanceMeters) * 100);

  return (
    <li className={`card overflow-hidden p-4 ${urgent ? "border-[#e5ad9f]" : ""}`}>
      {urgent && (
        <div
          className={`-mx-4 -mt-4 mb-4 flex items-center gap-2 px-4 py-2 text-xs font-semibold ${
            wearable.status === "sos" ? "bg-status-critical-bg text-status-critical" : "bg-[#fff2dd] text-[#a86c1d]"
          }`}
        >
          <Siren size={15} className={wearable.status === "sos" ? "status-pulse" : undefined} />
          {wearable.status === "sos" ? "SOS — guardian assistance required" : "Distance threshold exceeded"}
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="grid h-[39px] w-[39px] shrink-0 place-items-center rounded-full bg-[#e6ded2] font-heading text-xs font-semibold text-[#8c623d]">
          {initials(wearable.childName)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-ink">{wearable.childName}</h3>
          <p className="truncate text-xs text-ink-muted">Guardian: {wearable.guardianName}</p>
        </div>
        <span className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.classes}`}>
          <Icon size={13} />
          {meta.label}
        </span>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-[11px] text-ink-muted">
          <span>Distance from guardian</span>
          <b className="font-mono text-ink">
            {wearable.distanceMeters.toFixed(1)}m
            <span className="font-sans font-normal text-ink-muted"> / {wearable.safeDistanceMeters}m safe</span>
          </b>
        </div>
        <div className="mt-2 h-[7px] overflow-hidden rounded-full bg-[#eceae4]">
          <div
            className={`h-full rounded-full transition-[width] ${urgent ? "bg-status-critical" : "bg-status-low"}`}
            style={{ width: `${meterPct}%` }}
          />
        </div>
        {urgent && <p className="mt-1 text-[11px] text-status-critical">{overBy.toFixed(1)}m over safe range</p>}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#efede7] pt-3">
        <small className="text-[10px] text-ink-muted">{wearable.id} · Updated just now</small>
        {urgent && (
          <button type="button" onClick={() => resolveWearable(wearable.id)} className="btn-text">
            Mark safe
          </button>
        )}
      </div>
    </li>
  );
}
