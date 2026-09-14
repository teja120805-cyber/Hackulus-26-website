import { useSimulationStore } from "../lib/simulationStore";
import { MeshView } from "../components/network/MeshView";
import { AlertFeed } from "../components/dashboard/AlertFeed";

export function Network() {
  const nodes = useSimulationStore((s) => s.nodes);
  const alerts = useSimulationStore((s) => s.alerts);
  const nodeAlerts = alerts.filter((a) => a.type === "node");
  const online = nodes.filter((n) => n.connected).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Node Network</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {online}/{nodes.length} nodes online. Offline nodes reroute through a connected neighbor back to the hub.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <MeshView nodes={nodes} />
        <AlertFeed alerts={nodeAlerts} title="Node Alert History" emptyLabel="No node alerts yet." />
      </div>
    </div>
  );
}
