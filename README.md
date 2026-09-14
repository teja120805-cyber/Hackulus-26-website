# CrowdSense

**Crowd intelligence and child-safety dashboard for temporary events.**

CrowdSense is a hardware/embedded concept for a hackathon: distributed ESP32 nodes sense crowd
density zone-by-zone at a temporary event (concert, college fest, exhibition, amusement park) and
relay readings over a wireless mesh, while a physical PCB shaped like the venue lights up per zone
(green → yellow → orange → red) so security staff can see crowding at a glance. A child-safety
layer of BLE wearables alerts a guardian if a child moves outside a safe distance.

This repository is the **software side** of that concept: the operational dashboard an event
organizer or security team would actually use, plus a full client-side simulation layer standing
in for the hardware, so the app is completely demoable without any physical devices attached.
Hardware/BLE/mesh integration is a later phase — for now every reading is generated in-browser by
a simulation engine that behaves the way the real sensors would.

## Why this exists

Events with dense, shifting crowds (festival stages, exhibition halls, theme parks) have two
recurring failure modes: a zone quietly crosses a safe-capacity threshold before anyone notices,
and a child gets separated from a guardian in a crowd too loud and too large to search visually.
CrowdSense's premise is that both problems are solvable with cheap, disposable sensing hardware
and a dashboard that makes the *right* information impossible to miss — color and density alone
aren't enough, so every state is also labeled and iconified, and every anomaly lands in a live
alert feed instead of requiring someone to notice a color change.

## Tech stack

| Concern | Choice |
|---|---|
| UI framework | React 19 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v4 (`@theme` tokens, no config file — see `src/index.css`) |
| Routing | React Router v7 |
| State | Zustand (single store, no backend, no database, no auth) |
| Charts | Recharts (density trend chart, busiest-zones bar chart) |

There is no backend and no persistence beyond the browser tab's lifetime — every Zone, Node,
Wearable, and AlertEvent lives in memory and is produced by the simulation engine at
[`src/lib/simulationStore.ts`](src/lib/simulationStore.ts).

## Getting started

```bash
npm install
npm run dev
```

The dev server prints a local URL (default `http://localhost:5173`). Open it — the simulation
starts ticking immediately, no setup required.

Other scripts:

```bash
npm run build     # type-check (tsc -b) and produce a production build in dist/
npm run preview   # serve the production build locally
npm run lint       # run oxlint
```

## Pages

| Route | Purpose |
|---|---|
| `/` — **Live Dashboard** | The main screen: a venue map with each zone positioned and color-coded by status, a live alert feed, and a node-health summary. What an organizer glances at mid-event. |
| `/zones/:id` — **Zone Detail** | Drill into one zone: live status, a density-over-time chart against its capacity threshold, an editable threshold slider, and the nodes assigned to that zone. |
| `/safety` — **Safety / Wearables** | Every guardian–child pair with live distance and status. Separated or SOS pairs are sorted to the top and marked with icon + label, never color alone. Includes a safety-specific alert history. |
| `/network` — **Node Network** | Mesh topology view: nodes as points around a central hub, connection status, and battery. A dropped node visibly reroutes through a connected neighbor back to the hub — the "self-healing mesh" story — and shows reconnection when it recovers. |
| `/analytics` — **Analytics** | Post-event style reporting built from accumulated session history: peak zone, a ranked busiest-zones chart, a per-zone report table (avg/peak density, escalation time). The "organizer deliverable" screen. |
| `/settings` — **Settings** | Per-zone capacity thresholds, per-wearable safe distances, and basic venue map repositioning — plain form inputs bound to the shared store. |
| `/demo` — **Demo Control** | A judge-facing control surface for pitching live: individual trigger buttons plus a "Run Full Sequence" button that walks through baseline → escalate Stage → drop a relay node → resolve Stage → separate a wearable → trigger SOS, so a presenter isn't waiting on random simulation events to make the point. |

## Data model

```ts
type ZoneStatus = "low" | "moderate" | "high" | "critical" | "emergency";

interface Zone {
  id: string;
  name: string;
  position: { x: number; y: number };   // normalized 0-1, for placing on the venue map
  densityScore: number;                  // 0-100 (can exceed 100 when over capacity)
  capacityThreshold: number;             // organizer-configurable, per zone
  status: ZoneStatus;
  trend: number[];                       // recent density history for the sparkline/chart
}

interface Node {
  id: string;
  zoneId: string;
  batteryLevel: number;                  // 0-100
  connected: boolean;
  lastSeenSeconds: number;               // time since last contact, while disconnected
}

interface Wearable {
  id: string;
  childName: string;
  guardianName: string;
  distanceMeters: number;
  safeDistanceMeters: number;
  status: "safe" | "separated" | "sos";
}

interface AlertEvent {
  id: string;
  type: "zone" | "node" | "wearable";
  severity: "info" | "warning" | "critical";
  message: string;
  timestamp: number;
  zoneId?: string;
}
```

`ZoneStatus` is derived, not stored independently — [`src/lib/status.ts`](src/lib/status.ts)
computes it as a ratio of `densityScore` to `capacityThreshold` (≥115% → emergency, ≥100% →
critical, ≥80% → high, ≥50% → moderate, else low), so raising a zone's threshold in Settings
immediately relaxes its status without needing a separate recalculation step anywhere else.

## Simulation engine

[`src/lib/simulationStore.ts`](src/lib/simulationStore.ts) is a single Zustand store that owns
all app state and a `setInterval` clock (`startSimulationClock`, started once from `main.tsx`)
ticking every 2.5 seconds. Each tick:

- nudges every zone's `densityScore` up or down within realistic bounds and recomputes its status,
  pushing an alert whenever a zone crosses into `critical` or `emergency`
- occasionally (rarely) drops a node's `connected` flag, then reconnects it a few ticks later, so
  the Node Network view has real recovery behavior to show, not just static data
- occasionally pushes a wearable's `distanceMeters` past its `safeDistanceMeters`, flips it to
  `separated`, and raises an alert

On top of the automatic tick, the store exposes manual trigger functions the UI calls directly —
`escalateZone`, `resolveZone`, `dropNode`, `restoreNode`, `separateWearable`, `triggerSOS`,
`resolveWearable`, plus setters for thresholds, safe distances, zone names, and positions. The
Demo Control panel is built entirely on these triggers so a presenter can drive the dashboard
live instead of waiting on randomness. `resetSimulation()` regenerates the whole world from the
deterministic seed data in [`src/lib/mockData.ts`](src/lib/mockData.ts).

## Design direction

Light theme, deliberately not generic-SaaS-blue — a "whiteboard schematic" feel that nods to the
project's hardware origin: soft off-white background, dark graphite ink text, a warm copper
accent used sparingly for interactive elements, and the four status colors reserved strictly for
crowd-density and alert states so they stay meaningful. Tokens live in `@theme` inside
[`src/index.css`](src/index.css) (Tailwind v4, no `tailwind.config.js`):

| Token | Hex |
|---|---|
| Background | `#F7F6F2` |
| Surface / card | `#FFFFFF` |
| Border | `#E4E1D8` |
| Ink | `#22261F` |
| Muted ink | `#6B7268` |
| Accent (copper) | `#B5773A` |
| Status — low | `#3F9A5D` |
| Status — moderate | `#D9A82B` |
| Status — high | `#DB8A2E` |
| Status — critical / emergency | `#C94A34` |

Accessibility notes baked into the components, not bolted on after: every status indicator pairs
color with an icon and a text label (`StatusBadge`), focus states are visible everywhere via
`:focus-visible` (copper outline), and `prefers-reduced-motion` disables the pulse/attention
animations. The layout is responsive down to tablet width (this is realistically used on a tablet
at an event) with mobile as a bonus rather than a hard requirement.

## Project structure

```
src/
  types.ts                  # Zone / Node / Wearable / AlertEvent / ZoneStatus
  lib/
    simulationStore.ts      # Zustand store: state, tick loop, manual triggers
    mockData.ts             # deterministic seed data (7 zones, 10-14 nodes, 5 wearables)
    status.ts                # densityScore -> ZoneStatus, status color tokens
  components/
    layout/AppShell.tsx      # top nav, node/alert summary, Demo Control entry point
    StatusBadge.tsx           # color + icon + label status pill
    dashboard/                # VenueMap, AlertFeed, NodeHealthSummary
    zone/DensityChart.tsx     # Recharts area chart with threshold reference line
    safety/WearableRow.tsx    # guardian/child pair row with safe/separated/SOS states
    network/MeshView.tsx      # SVG mesh topology with reroute-on-drop visualization
    demo/DemoControlPanel.tsx # judge-facing trigger sequence
  pages/                     # one component per route, thin — compose the components above
```

## Non-goals for this version

- No authentication, no backend, no persistence beyond the browser session
- No real hardware / BLE / mesh integration — the simulation layer stands in for it entirely
- No payment or business-model screens — this is the operational dashboard only
