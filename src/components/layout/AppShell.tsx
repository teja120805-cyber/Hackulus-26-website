import { NavLink, Outlet } from "react-router-dom";
import { useSimulationStore } from "../../lib/simulationStore";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/safety", label: "Safety" },
  { to: "/network", label: "Network" },
  { to: "/analytics", label: "Analytics" },
  { to: "/settings", label: "Settings" },
];

export function AppShell() {
  const nodes = useSimulationStore((s) => s.nodes);
  const wearables = useSimulationStore((s) => s.wearables);
  const onlineNodes = nodes.filter((n) => n.connected).length;
  const activeAlerts = wearables.filter((w) => w.status !== "safe").length;

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-block h-3 w-3 rounded-full bg-accent" aria-hidden="true" />
            <span className="font-semibold text-lg tracking-tight text-ink">CrowdSense</span>
          </div>

          <nav aria-label="Primary" className="flex-1 overflow-x-auto">
            <ul className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `inline-block whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-accent/10 text-accent"
                          : "text-ink-muted hover:text-ink hover:bg-bg"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden md:flex items-center gap-3 text-xs text-ink-muted shrink-0">
            <span>
              {onlineNodes}/{nodes.length} nodes online
            </span>
            {activeAlerts > 0 && (
              <span className="rounded-full bg-status-critical-bg px-2 py-1 font-medium text-status-critical">
                {activeAlerts} wearable alert{activeAlerts === 1 ? "" : "s"}
              </span>
            )}
          </div>

          <NavLink
            to="/demo"
            className={({ isActive }) =>
              `shrink-0 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-accent bg-accent text-white"
                  : "border-accent text-accent hover:bg-accent hover:text-white"
              }`
            }
          >
            Demo Control
          </NavLink>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-[1400px] px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
