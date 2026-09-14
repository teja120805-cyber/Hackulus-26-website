import { Link } from "react-router-dom";
import type { Zone } from "../../types";
import { STATUS_BG, STATUS_COLOR } from "../../lib/status";
import { StatusBadge } from "../StatusBadge";

interface VenueMapProps {
  zones: Zone[];
}

export function VenueMap({ zones }: VenueMapProps) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-border bg-surface"
      style={{
        aspectRatio: "4 / 3",
        backgroundImage:
          "linear-gradient(#eceadf 1px, transparent 1px), linear-gradient(90deg, #eceadf 1px, transparent 1px)",
        backgroundSize: "8% 8%",
      }}
      role="group"
      aria-label="Venue map of zones"
    >
      {zones.map((zone) => {
        const urgent = zone.status === "critical" || zone.status === "emergency";
        return (
          <Link
            key={zone.id}
            to={`/zones/${zone.id}`}
            className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-lg p-2 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            style={{ left: `${zone.position.x * 100}%`, top: `${zone.position.y * 100}%` }}
          >
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-full border-2 text-sm font-semibold shadow-sm transition-transform group-hover:scale-105 ${
                urgent ? "status-pulse" : ""
              }`}
              style={{
                background: STATUS_BG[zone.status],
                borderColor: STATUS_COLOR[zone.status],
                color: STATUS_COLOR[zone.status],
              }}
            >
              {zone.densityScore}
            </span>
            <span className="max-w-[7rem] rounded bg-surface/90 px-1.5 py-0.5 text-xs font-medium text-ink shadow-sm">
              {zone.name}
            </span>
            <StatusBadge status={zone.status} size="sm" />
          </Link>
        );
      })}
    </div>
  );
}
