# CrowdSense

Crowd intelligence and child-safety dashboard for temporary events (concerts, college fests,
exhibitions). This is the software side of a hackathon hardware concept: ESP32 mesh nodes sensing
zone-by-zone crowd density, plus BLE wearables for guardian/child safety. This app simulates that
hardware live so the dashboard is fully demoable without any physical devices attached.

## Stack

React + TypeScript, Vite, Tailwind CSS v4, React Router, Zustand, Recharts.

## Running it

```bash
npm install
npm run dev
```

## Pages

- **Dashboard** (`/`) — venue map of zones, live alert feed, node health summary
- **Zone Detail** (`/zones/:id`) — density history chart, capacity threshold, nodes in zone
- **Safety** (`/safety`) — guardian/child wearable pairs, separation & SOS states
- **Network** (`/network`) — mesh topology, node battery/connection status, self-healing reroutes
- **Analytics** (`/analytics`) — post-event reporting from accumulated session history
- **Settings** (`/settings`) — per-zone thresholds, wearable safe distances, map positions
- **Demo Control** (`/demo`) — manual trigger panel for driving a live pitch demo

All data is generated in-memory by a simulation engine (`src/lib/simulationStore.ts`) that ticks
every 2.5 seconds — no backend, no persistence beyond the browser session.
