import type { Wearable } from "../../types";
import { useSimulationStore } from "../../lib/simulationStore";

interface WearableRowProps {
  wearable: Wearable;
}

const STATUS_META: Record<Wearable["status"], { label: string; icon: string; classes: string }> = {
  safe: { label: "Safe", icon: "●", classes: "bg-status-low-bg text-status-low" },
  separated: { label: "Separated", icon: "▲", classes: "bg-status-moderate-bg text-status-moderate" },
  sos: { label: "SOS", icon: "✕", classes: "bg-status-critical-bg text-status-critical" },
};

export function WearableRow({ wearable }: WearableRowProps) {
  const resolveWearable = useSimulationStore((s) => s.resolveWearable);
  const meta = STATUS_META[wearable.status];
  const urgent = wearable.status !== "safe";
  const overBy = wearable.distanceMeters - wearable.safeDistanceMeters;

  return (
    <li
      className={`flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
        urgent ? "border-status-critical bg-status-critical-bg/40" : "border-border bg-surface"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold ${meta.classes} ${
            wearable.status === "sos" ? "status-pulse" : ""
          }`}
          aria-hidden="true"
        >
          {meta.icon}
        </span>
        <div>
          <p className="font-medium text-ink">
            {wearable.childName}{" "}
            <span className="font-normal text-ink-muted">with {wearable.guardianName}</span>
          </p>
          <p className="text-xs text-ink-muted">
            {wearable.distanceMeters.toFixed(1)}m away · safe range {wearable.safeDistanceMeters}m
            {urgent && ` · ${overBy.toFixed(1)}m over`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${meta.classes}`}>
          {meta.icon} {meta.label}
        </span>
        {urgent && (
          <button
            type="button"
            onClick={() => resolveWearable(wearable.id)}
            className="rounded-md border border-accent px-3 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-white"
          >
            Mark Safe
          </button>
        )}
      </div>
    </li>
  );
}
