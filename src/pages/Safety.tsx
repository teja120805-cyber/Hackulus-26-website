import { useMemo } from "react";
import { useSimulationStore } from "../lib/simulationStore";
import { WearableRow } from "../components/safety/WearableRow";
import { AlertFeed } from "../components/dashboard/AlertFeed";
import { PageIntro } from "../components/PageIntro";

const STATUS_RANK: Record<string, number> = { sos: 0, separated: 1, safe: 2 };

export function Safety() {
  const wearables = useSimulationStore((s) => s.wearables);
  const alerts = useSimulationStore((s) => s.alerts);

  const sorted = useMemo(
    () => [...wearables].sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]),
    [wearables],
  );
  const wearableAlerts = useMemo(() => alerts.filter((a) => a.type === "wearable"), [alerts]);
  const safeCount = wearables.filter((w) => w.status === "safe").length;

  return (
    <div className="flex flex-col gap-6">
      <PageIntro
        eyebrow="Child Safety"
        title="Every child accounted for."
        description="BLE wearable proximity monitoring for peace of mind."
        compact
        action={
          <div className="text-right">
            <strong className="font-heading text-4xl font-semibold text-status-low">
              {safeCount}
              <small className="text-lg font-normal text-ink-muted"> / {wearables.length}</small>
            </strong>
            <span className="block text-sm text-ink-muted">within safe range</span>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <ul className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {sorted.map((w) => (
            <WearableRow key={w.id} wearable={w} />
          ))}
        </ul>
        <AlertFeed alerts={wearableAlerts} title="Safety Alert History" emptyLabel="No safety alerts yet." />
      </div>
    </div>
  );
}
