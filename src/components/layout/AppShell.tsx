import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Activity,
  Bell,
  ChevronRight,
  Gauge,
  LayoutDashboard,
  Menu,
  Network as NetworkIcon,
  Play,
  Settings as SettingsIcon,
  ShieldAlert,
} from "lucide-react";
import { useSimulationStore } from "../../lib/simulationStore";

const NAV_ITEMS = [
  { section: "Monitor", items: [
    { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/safety", label: "Safety & Wearables", icon: ShieldAlert, badgeKey: "wearables" as const },
    { to: "/network", label: "Node Network", icon: NetworkIcon },
  ] },
  { section: "Report", items: [
    { to: "/analytics", label: "Analytics", icon: Gauge },
    { to: "/settings", label: "Settings", icon: SettingsIcon },
  ] },
];

const PAGE_COPY: Record<string, { eyebrow: string; title: string }> = {
  "/": { eyebrow: "LIVE EVENT / VIT VELLORE", title: "Overview" },
  "/safety": { eyebrow: "GUARDIAN PROXIMITY MONITORING", title: "Safety & Wearables" },
  "/network": { eyebrow: "MESH HEALTH / SELF-HEALING RELAYS", title: "Node Network" },
  "/analytics": { eyebrow: "EVENT REPORT / LIVE PREVIEW", title: "Analytics" },
  "/settings": { eyebrow: "EVENT CONFIGURATION", title: "Settings" },
  "/demo": { eyebrow: "PRESENTATION MODE", title: "Demo Control" },
};

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const nodes = useSimulationStore((s) => s.nodes);
  const wearables = useSimulationStore((s) => s.wearables);
  const onlineNodes = nodes.filter((n) => n.connected).length;
  const activeWearableAlerts = wearables.filter((w) => w.status !== "safe").length;

  const currentPage =
    PAGE_COPY[location.pathname] ??
    (location.pathname.startsWith("/zones/")
      ? { eyebrow: "ZONE MONITORING / LIVE SENSOR DATA", title: "Zone Detail" }
      : { eyebrow: "LIVE EVENT", title: "CrowdSense" });

  return (
    <div className="flex min-h-full bg-bg">
      <aside
        className={`fixed inset-y-0 left-0 z-20 flex w-64 shrink-0 flex-col border-r border-border bg-sidebar px-4 pb-4 pt-7 transition-transform duration-200 sm:static sm:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2.5 px-2 font-heading text-xl font-bold tracking-tight text-ink">
          <span className="flex h-8 w-8 -rotate-3 items-center justify-center rounded-[9px] bg-ink text-white">
            <Activity size={18} />
          </span>
          Crowd<span className="text-accent">Sense</span>
        </div>

        <div className="mx-2 my-7 flex items-center gap-2 rounded-lg border border-[#d7d4cb] bg-[#f8f7f3] px-2.5 py-2 font-mono text-[10px] tracking-wide text-ink-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-status-low shadow-[0_0_0_3px_rgba(63,154,93,0.12)]" aria-hidden="true" />
          LIVE EVENT
          <ChevronRight size={14} className="ml-auto" />
        </div>

        <nav aria-label="Primary" onClick={() => setMobileNavOpen(false)} className="flex-1">
          {NAV_ITEMS.map((group) => (
            <div key={group.section}>
              <p className="mb-2 mt-6 px-3 font-mono text-[10px] font-medium tracking-[0.14em] text-[#9a9d94] first:mt-0">
                {group.section}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const badgeCount = item.badgeKey === "wearables" ? activeWearableAlerts : 0;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `relative my-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150 ${
                        isActive
                          ? "bg-white font-semibold text-ink shadow-[0_8px_24px_rgba(54,48,36,0.05)] before:absolute before:-left-4 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r before:bg-accent"
                          : "text-[#626960] hover:translate-x-0.5 hover:bg-white/60 hover:text-ink"
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    {badgeCount > 0 && (
                      <b className="ml-auto rounded-full bg-[#f2ded2] px-1.5 py-0.5 font-mono text-[10px] font-normal text-status-critical">
                        {badgeCount}
                      </b>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="mt-auto">
          <Link
            to="/demo"
            onClick={() => setMobileNavOpen(false)}
            className="mb-2 flex items-center gap-2.5 rounded-lg bg-ink px-3 py-2.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            <Play size={16} />
            Demo Control
            <span className="ml-auto font-mono text-[10px] text-[#a7aaa3]">Live</span>
          </Link>
          <div className="flex items-center gap-2.5 border-t border-[#d7d4cb] px-1.5 pt-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d3a87e] font-heading text-[11px] font-semibold text-white">
              OT
            </span>
            <div className="flex-1">
              <b className="block text-xs">Organizer</b>
              <small className="block text-[11px] text-ink-muted">Event lead</small>
            </div>
          </div>
        </div>
      </aside>

      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-10 bg-ink/25 sm:hidden"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-[72px] items-center gap-3.5 border-b border-border bg-bg/90 px-4 backdrop-blur sm:h-[86px] sm:px-10">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
            className="grid place-items-center rounded-lg p-2 text-[#636a61] hover:bg-[#e9e7df] sm:hidden"
          >
            <Menu size={20} />
          </button>
          <div>
            <span className="eyebrow">{currentPage.eyebrow}</span>
            <h1 className="mt-0.5 font-heading text-lg font-semibold text-ink">{currentPage.title}</h1>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="hidden items-center gap-1.5 text-xs text-[#566055] md:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-status-low shadow-[0_0_0_3px_rgba(63,154,93,0.12)]" aria-hidden="true" />
              Systems live
              <small className="ml-0.5 text-[10px] text-[#92988e]">Synced just now</small>
            </span>
            <Link
              to="/safety"
              aria-label={`Open safety alerts${activeWearableAlerts ? `, ${activeWearableAlerts} active` : ""}`}
              className="relative grid place-items-center rounded-lg p-2 text-[#636a61] hover:bg-[#e9e7df] hover:text-ink"
            >
              <Bell size={18} />
              {activeWearableAlerts > 0 && (
                <span className="absolute right-0.5 top-0.5 grid h-[15px] min-w-[15px] place-items-center rounded-full border-2 border-bg bg-status-critical px-1 font-mono text-[9px] font-semibold text-white">
                  {activeWearableAlerts}
                </span>
              )}
            </Link>
            <span className="hidden text-[10px] text-ink-muted sm:block">
              {onlineNodes}/{nodes.length} nodes online
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1380px] flex-1 px-4 py-8 sm:px-10 sm:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
