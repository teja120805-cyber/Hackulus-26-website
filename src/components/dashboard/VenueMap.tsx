import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Zone } from "../../types";
import { STATUS_BG, STATUS_COLOR } from "../../lib/status";
import { STATUS_LABEL } from "../../types";

// VIT Vellore main campus, Katpadi, Tamil Nadu.
const VIT_VELLORE_CENTER: [number, number] = [12.9692, 79.1559];

interface VenueMapProps {
  zones: Zone[];
}

function buildIcon(zone: Zone) {
  const urgent = zone.status === "critical" || zone.status === "emergency";
  const html = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:3px;pointer-events:auto;cursor:pointer;">
      <span style="
        display:flex;align-items:center;justify-content:center;
        height:56px;width:56px;border-radius:9999px;
        border:3px solid ${STATUS_COLOR[zone.status]};
        background:${STATUS_BG[zone.status]};
        color:${STATUS_COLOR[zone.status]};
        font-weight:700;font-size:17px;font-family:system-ui,sans-serif;
        box-shadow:0 1px 3px rgba(0,0,0,0.25);
        ${urgent ? "animation:cs-pulse 1.6s ease-in-out infinite;" : ""}
      ">${zone.densityScore}</span>
      <span style="
        max-width:10rem;text-align:center;border-radius:4px;
        background:rgba(255,255,255,0.95);padding:2px 8px;
        font-size:14px;font-weight:600;color:#22261f;font-family:system-ui,sans-serif;
        box-shadow:0 1px 2px rgba(0,0,0,0.15);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
      ">${zone.name}</span>
      <span style="
        border-radius:9999px;padding:2px 10px;font-size:12px;font-weight:600;
        font-family:system-ui,sans-serif;
        background:${STATUS_BG[zone.status]};color:${STATUS_COLOR[zone.status]};
      ">${STATUS_LABEL[zone.status]}</span>
    </div>
  `;
  return L.divIcon({
    html,
    className: "crowdsense-zone-marker",
    iconSize: [160, 96],
    iconAnchor: [80, 52],
  });
}

export function VenueMap({ zones }: VenueMapProps) {
  const navigate = useNavigate();
  const icons = useMemo(() => zones.map((zone) => ({ zone, icon: buildIcon(zone) })), [zones]);

  return (
    <section className="card p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Venue Map · VIT Vellore</p>
          <h2 className="mt-0.5 font-heading text-lg font-semibold text-ink">Live density by zone</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted">
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-status-low" /> Low
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-status-moderate" /> Moderate
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-status-high" /> High
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-status-critical" /> Critical
          </span>
        </div>
      </div>
      <div
        className="w-full overflow-hidden rounded-lg border border-border"
        style={{ aspectRatio: "4 / 3" }}
        role="group"
        aria-label="Venue map of zones at VIT Vellore"
      >
        <style>{`
          @keyframes cs-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
          @media (prefers-reduced-motion: reduce) {
            .crowdsense-zone-marker * { animation: none !important; }
          }
        `}</style>
        <MapContainer
          center={VIT_VELLORE_CENTER}
          zoom={16}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {icons.map(({ zone, icon }) => (
            <Marker
              key={zone.id}
              position={[zone.position.lat, zone.position.lng]}
              icon={icon}
              eventHandlers={{ click: () => navigate(`/zones/${zone.id}`) }}
              keyboard
              alt={`${zone.name}: ${STATUS_LABEL[zone.status]}, density ${zone.densityScore}`}
            />
          ))}
        </MapContainer>
      </div>
    </section>
  );
}
