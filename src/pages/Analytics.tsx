import { useMemo } from "react";
import { Activity, AlertTriangle, Gauge, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useSimulationStore } from "../lib/simulationStore";
import { STATUS_COLOR } from "../lib/status";
import { PageIntro } from "../components/PageIntro";
import { StatCard } from "../components/StatCard";

const TICK_SECONDS = 2.5;

export function Analytics() {
  const zones = useSimulationStore((s) => s.zones);
  const history = useSimulationStore((s) => s.history);
  const alerts = useSimulationStore((s) => s.alerts);

  const zoneStats = useMemo(() => {
    return zones.map((zone) => {
      const points = history.filter((h) => h.zoneId === zone.id);
      const avg = points.length ? points.reduce((sum, p) => sum + p.densityScore, 0) / points.length : zone.densityScore;
      const peak = points.length ? Math.max(...points.map((p) => p.densityScore)) : zone.densityScore;
      const escalationTicks = points.filter((p) => p.status === "critical" || p.status === "emergency").length;
      return {
        zone,
        avg: Math.round(avg),
        peak: Math.round(peak),
        escalationSeconds: Math.round(escalationTicks * TICK_SECONDS),
      };
    });
  }, [zones, history]);

  const busiest = useMemo(() => [...zoneStats].sort((a, b) => b.avg - a.avg), [zoneStats]);
  const peakOverall = useMemo(() => [...zoneStats].sort((a, b) => b.peak - a.peak)[0], [zoneStats]);
  const totalEscalations = alerts.filter((a) => a.type === "zone" && a.severity !== "info").length;
  const avgDensity = Math.round(zones.reduce((sum, z) => sum + z.densityScore, 0) / zones.length);

  return (
    <div className="flex flex-col gap-6">
      <PageIntro
        eyebrow="Event Report · Live Preview"
        title="Read the room."
        description={`A clear picture of how your event is moving (${history.length} samples logged).`}
        compact
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Peak zone" value={`${peakOverall?.peak ?? 0}`} detail={peakOverall?.zone.name ?? "—"} icon={Activity} tone="alert" />
        <StatCard label="Avg. density" value={`${avgDensity}`} detail="Across all zones" icon={Users} tone="copper" />
        <StatCard label="Escalations" value={String(totalEscalations)} detail="Critical / emergency events" icon={AlertTriangle} />
        <StatCard
          label="Longest escalation"
          value={`${Math.max(0, ...zoneStats.map((z) => z.escalationSeconds))}s`}
          detail="Time above threshold"
          icon={Gauge}
          tone="safe"
        />
      </div>

      <section className="card p-5">
        <p className="eyebrow">Crowd Flow</p>
        <h2 className="mt-0.5 mb-3 font-heading text-lg font-semibold text-ink">Busiest zones (avg. density)</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={busiest} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e1d8" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 13, fill: "#6b7268" }} />
              <YAxis
                type="category"
                dataKey={(d: (typeof busiest)[number]) => d.zone.name}
                width={160}
                tick={{ fontSize: 14, fill: "#22261f" }}
              />
              <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#e4e1d8", fontSize: 14 }} />
              <Bar dataKey="avg" radius={[0, 6, 6, 0]}>
                {busiest.map((entry) => (
                  <Cell key={entry.zone.id} fill={STATUS_COLOR[entry.zone.status]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card p-5">
        <p className="eyebrow">Ranked</p>
        <h2 className="mt-0.5 mb-3 font-heading text-lg font-semibold text-ink">Zone report</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-base">
            <thead>
              <tr className="border-b border-border text-sm text-ink-muted">
                <th className="py-2.5 pr-4 font-medium">Zone</th>
                <th className="py-2.5 pr-4 font-medium">Avg. Density</th>
                <th className="py-2.5 pr-4 font-medium">Peak Density</th>
                <th className="py-2.5 pr-4 font-medium">Threshold</th>
                <th className="py-2.5 pr-4 font-medium">Escalation Time</th>
              </tr>
            </thead>
            <tbody>
              {busiest.map(({ zone, avg, peak, escalationSeconds }) => (
                <tr key={zone.id} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4 font-medium text-ink">{zone.name}</td>
                  <td className="py-3 pr-4 text-ink-muted">{avg}</td>
                  <td className="py-3 pr-4 text-ink-muted">{peak}</td>
                  <td className="py-3 pr-4 text-ink-muted">{zone.capacityThreshold}</td>
                  <td className="py-3 pr-4 text-ink-muted">{escalationSeconds}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
