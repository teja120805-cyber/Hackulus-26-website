import { useMemo } from "react";
import { useSimulationStore } from "../lib/simulationStore";
import { WearableRow } from "../components/safety/WearableRow";
import { AlertFeed } from "../components/dashboard/AlertFeed";

const STATUS_RANK: Record<string, number> = { sos: 0, separated: 1, safe: 2 };

export function Safety() {
  const wearables = useSimulationStore((s) => s.wearables);
  const alerts = useSimulationStore((s) => s.alerts);

  const sorted = useMemo(
    () => [...wearables].sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]),
    [wearables],
  );
  const wearableAlerts = useMemo(() => alerts.filter((a) => a.type === "wearable"), [alerts]);
  const activeCount = wearables.filter((w) => w.status !== "safe").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Safety / Wearables</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {activeCount === 0
            ? "All guardian-child pairs are within safe range."
            : `${activeCount} pair${activeCount === 1 ? "" : "s"} need attention.`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <ul className="flex flex-col gap-3">
          {sorted.map((w) => (
            <WearableRow key={w.id} wearable={w} />
          ))}
        </ul>
        <AlertFeed alerts={wearableAlerts} title="Safety Alert History" emptyLabel="No safety alerts yet." />
      </div>
    </div>
  );
}
