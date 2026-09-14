import { Bell, ChevronRight, Play, Radio, ShieldAlert, TriangleAlert, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSimulationStore } from "../lib/simulationStore";
import { VenueMap } from "../components/dashboard/VenueMap";
import { AlertFeed } from "../components/dashboard/AlertFeed";
import { NodeHealthSummary } from "../components/dashboard/NodeHealthSummary";
import { PageIntro } from "../components/PageIntro";
import { StatCard } from "../components/StatCard";

export function Dashboard() {
  const navigate = useNavigate();
  const zones = useSimulationStore((s) => s.zones);
  const nodes = useSimulationStore((s) => s.nodes);
  const alerts = useSimulationStore((s) => s.alerts);
  const wearables = useSimulationStore((s) => s.wearables);

  const avgDensity = Math.round(zones.reduce((sum, z) => sum + z.densityScore, 0) / zones.length);
  const activeAlerts = alerts.filter((a) => a.severity !== "info");
  const safeWearables = wearables.filter((w) => w.status === "safe").length;

  return (
    <div className="flex flex-col gap-6">
      <PageIntro
        eyebrow="Command Center"
        title={
          <>
            Know your crowd.
            <br />
            <em className="text-accent not-italic">Act with confidence.</em>
          </>
        }
        description="Live situational awareness for every corner of your event."
        action={
          <button type="button" onClick={() => navigate("/demo")} className="btn-primary shrink-0">
            <Play size={16} />
            Run a demo scenario
          </button>
        }
      />

      {activeAlerts.length > 0 && (
        <button
          type="button"
          onClick={() => navigate("/safety")}
          className="flex w-full items-center gap-3 rounded-xl border border-[#efcbbf] bg-[#fff8f5] px-4 py-3 text-left transition-all hover:-translate-y-px hover:bg-[#fff1ec]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-status-critical-bg text-status-critical">
            <TriangleAlert size={18} />
          </span>
          <span className="flex-1">
            <b className="block text-base text-ink">
              {activeAlerts.length} active {activeAlerts.length === 1 ? "alert" : "alerts"} need attention
            </b>
            <small className="mt-0.5 block text-sm text-[#8a7067]">{activeAlerts[0].message}</small>
          </span>
          <ChevronRight size={20} className="shrink-0 text-ink-muted" />
        </button>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Crowd density" value={`${avgDensity}%`} detail="Across all zones · avg" icon={Users} tone="copper" />
        <StatCard
          label="Active alerts"
          value={String(activeAlerts.length)}
          detail="Needs attention"
          icon={Bell}
          tone={activeAlerts.length > 0 ? "alert" : "default"}
        />
        <StatCard
          label="Relay network"
          value={`${nodes.filter((n) => n.connected).length}/${nodes.length}`}
          detail="Nodes online"
          icon={Radio}
        />
        <StatCard
          label="Safety wearables"
          value={`${safeWearables}/${wearables.length}`}
          detail="Children accounted for"
          icon={ShieldAlert}
          tone="safe"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <VenueMap zones={zones} />
        <div className="flex flex-col gap-6">
          <NodeHealthSummary nodes={nodes} />
          <AlertFeed alerts={alerts} limit={5} />
        </div>
      </div>

      <section className="card p-5">
        <div className="mb-1 flex items-center justify-between">
          <div>
            <p className="eyebrow">Zone Snapshot</p>
            <h2 className="mt-0.5 font-heading text-lg font-semibold text-ink">At a glance</h2>
          </div>
          <Link to="/analytics" className="btn-text">
            View analytics <ChevronRight size={17} />
          </Link>
        </div>
        <div className="flex flex-col">
          {zones.map((zone) => (
            <button
              key={zone.id}
              type="button"
              onClick={() => navigate(`/zones/${zone.id}`)}
              className="grid grid-cols-[1.4fr_1fr_3rem] items-center gap-3 border-b border-[#f0eee8] py-3.5 text-left last:border-0 hover:bg-[#fbfaf7] sm:grid-cols-[1.4fr_1fr_48px_5rem_1.5rem]"
            >
              <span className="flex items-center gap-2 truncate text-base text-ink">
                <i
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: `var(--color-status-${zone.status})` }}
                />
                {zone.name}
              </span>
              <span className="hidden h-1.5 overflow-hidden rounded-full bg-[#eceae4] sm:block">
                <i
                  className="block h-full rounded-full"
                  style={{ width: `${Math.min(100, zone.densityScore)}%`, background: `var(--color-status-${zone.status})` }}
                />
              </span>
              <b className="font-mono text-sm text-ink">{zone.densityScore}%</b>
              <span className="hidden sm:block" />
              <ChevronRight size={18} className="hidden shrink-0 text-ink-muted sm:block" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
