import { Radio } from "lucide-react";
import { useSimulationStore } from "../lib/simulationStore";
import { MeshView } from "../components/network/MeshView";
import { AlertFeed } from "../components/dashboard/AlertFeed";
import { PageIntro } from "../components/PageIntro";

export function Network() {
  const nodes = useSimulationStore((s) => s.nodes);
  const alerts = useSimulationStore((s) => s.alerts);
  const nodeAlerts = alerts.filter((a) => a.type === "node");
  const online = nodes.filter((n) => n.connected).length;

  return (
    <div className="flex flex-col gap-6">
      <PageIntro
        eyebrow="Mesh Topology"
        title="Self-healing network."
        description="Every reading finds a path back to the control room."
        compact
        action={
          <div className="flex items-center gap-2 rounded-lg border border-[#d6e8d8] px-3.5 py-2.5 text-sm text-status-low">
            <Radio size={18} />
            <b className="font-heading text-base">
              {online}/{nodes.length}
            </b>
            relays online
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <MeshView nodes={nodes} />
        <AlertFeed alerts={nodeAlerts} title="Node Alert History" emptyLabel="No node alerts yet." />
      </div>
    </div>
  );
}
