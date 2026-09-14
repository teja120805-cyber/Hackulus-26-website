import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useSimulationStore } from "../lib/simulationStore";
import { STATUS_COLOR } from "../lib/status";

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
  const peakOverall = useMemo(
    () => [...zoneStats].sort((a, b) => b.peak - a.peak)[0],
    [zoneStats],
  );
  const totalEscalations = alerts.filter((a) => a.type === "zone" && a.severity !== "info").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Analytics</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Post-event reporting from accumulated session history ({history.length} samples logged).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs font-medium text-ink-muted">Peak Zone</p>
          <p className="mt-1 text-xl font-semibold text-ink">{peakOverall?.zone.name ?? "—"}</p>
          <p className="text-sm text-ink-muted">{peakOverall?.peak ?? 0} peak density</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs font-medium text-ink-muted">Total Escalations</p>
          <p className="mt-1 text-xl font-semibold text-ink">{totalEscalations}</p>
          <p className="text-sm text-ink-muted">critical / emergency events</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs font-medium text-ink-muted">Longest Escalation</p>
          <p className="mt-1 text-xl font-semibold text-ink">
            {Math.max(0, ...zoneStats.map((z) => z.escalationSeconds))}s
          </p>
          <p className="text-sm text-ink-muted">time spent above threshold</p>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold text-ink">Busiest Zones (avg. density)</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={busiest} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e1d8" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#6b7268" }} />
              <YAxis
                type="category"
                dataKey={(d: (typeof busiest)[number]) => d.zone.name}
                width={110}
                tick={{ fontSize: 12, fill: "#22261f" }}
              />
              <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#e4e1d8", fontSize: 12 }} />
              <Bar dataKey="avg" radius={[0, 6, 6, 0]}>
                {busiest.map((entry) => (
                  <Cell key={entry.zone.id} fill={STATUS_COLOR[entry.zone.status]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold text-ink">Zone Report</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-ink-muted">
                <th className="py-2 pr-4 font-medium">Zone</th>
                <th className="py-2 pr-4 font-medium">Avg. Density</th>
                <th className="py-2 pr-4 font-medium">Peak Density</th>
                <th className="py-2 pr-4 font-medium">Threshold</th>
                <th className="py-2 pr-4 font-medium">Escalation Time</th>
              </tr>
            </thead>
            <tbody>
              {busiest.map(({ zone, avg, peak, escalationSeconds }) => (
                <tr key={zone.id} className="border-b border-border last:border-0">
                  <td className="py-2 pr-4 font-medium text-ink">{zone.name}</td>
                  <td className="py-2 pr-4 text-ink-muted">{avg}</td>
                  <td className="py-2 pr-4 text-ink-muted">{peak}</td>
                  <td className="py-2 pr-4 text-ink-muted">{zone.capacityThreshold}</td>
                  <td className="py-2 pr-4 text-ink-muted">{escalationSeconds}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
