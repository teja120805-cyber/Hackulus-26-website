# CrowdSense — Hardware Demo Architecture

## 1. Objective

Build a physical hardware demonstrator of the CrowdSense concept: a **fail-safe ESP32 mesh network** centered on a custom PCB badge (worn on a lanyard) that transmits crowd-safety and proximity data to two relay ESP32 nodes, which then forward it to the central dashboard. The badge's PCB silkscreen is a map of the **VIT Vellore campus**, with LEDs embedded over important buildings that light up to reflect real-time crowd density zones.

## 2. System Overview

```
┌──────────────────────┐         BLE / WiFi            ┌─────────────────────┐
│  USER LANYARD BADGE  │  ←→  ←→  ←→  ←→  ←→  ←→  ←→  │   RELAY NODE A      │
│  ESP32 + PCB Map     │     ESP-NOW / WiFi Mesh       │  ESP32 + PCB Map    │
│  • OLED/Led Matrix   │                               │  • OLED/Led Matrix  │
│  • IMU / Button      │                               │  • IMU               │
│  • Status LEDs       │                               │  • Battery monitor   │
└──────────────────────┘                               └─────────────────────┘
         │                                                │
         │  Mesh sync (bidirectional)                      │
         └───────────────────────────────────────────────→│
                                                           │
┌──────────────────────┐                                 │
│  RELAY NODE B        │ ◄───────────────────────────────┘
│  ESP32 + PCB Map     │
│  • OLED/Led Matrix   │
│  • IMU               │
└──────────────────────┘
         │
         │  UDP / HTTP / MQTT
         ▼
┌──────────────────────────────────┐
│   CROWDSENSE DASHBOARD           │
│  (React 19 + TypeScript)         │
│  • Venue Map (Leaflet/OpenStreetMap)│
│  • Mesh Topology View            │
│  • Alert Feed                    │
│  • Zone Detail                   │
│  • Safety / Wearables            │
└──────────────────────────────────┘
```

## 3. Hardware Components

### 3.1 User Lanyard Badge (Primary Device)

**Role:** Mobile user endpoint — carries a BLE beacon, reads its own sensors, and broadcasts status to the relay network.

| Component | Specification |
|---|---|
| MCU | ESP32-WROOM-32 (or ESP32-S3) |
| Power | 500mAh LiPo + MCP73831 charger, USB-C |
| Sensors | MPU-6050 (IMU for gesture/fall), BMP280 (pressure/altitude) |
| Proximity | Built-in BLE Tx for RSSI-based distance to guardians |
| User Input | Momentary tactile button (SOS trigger) |
| Feedback | WS2812B LED strip (8–16 LEDs) on PCB silkscreen paths, 0.96" OLED for text |
| Enclosure | Custom 2-layer PCB, ~50mm × 70mm, with lanyard hole |
| PCB Silkscreen | VIT Vellore campus map; LEDs aligned to: SJT, Food Court, Main Building, TT, Anna Auditorium, Library, G-Block |

### 3.2 Relay Nodes A & B (Fixed Infrastructure)

**Role:** Mesh routers and data concentrators. Receive from the lanyard badge (and potentially other badges), aggregate, and forward to the dashboard. Provide fail-safe redundancy — if one relay is down, the lanyard communicates through the other.

| Component | Specification |
|---|---|
| MCU | ESP32-WROOM-32 |
| Power | 18650 Li-ion + TP4056 module, or wall-powered 5V USB |
| Connectivity | WiFi (to dashboard AP), WiFi Mesh / ESP-NOW (to other nodes) |
| Display | 1.3" OLED (SSD1306) showing node status, battery, mesh health |
| Indicators | 4× WS2861 LEDs for per-building density status on PCB silkscreen |
| Buttons | Reset button, mesh-diagnostic toggle |
| Enclosure | Custom PCB with same VIT map silkscreen, wall-mountable / stand-up case |

### 3.3 Dashboard (Central Console)

Runs on the existing React + Vite web app (see `/src`), connecting to the relay nodes over **WiFi UDP broadcast** or **MQTT over HTTP** to a lightweight broker running on Relay A.

## 4. Network Protocol

### 4.1 Layer Breakdown

| Layer | Technology | Purpose |
|---|---|---|
| Physical | 2.4 GHz WiFi (802.11 b/g/n) + BLE 4.2 | Radio for ESP32 nodes; BLE used for badge-to-relay proximity |
| Transport | UDP unicast/multicast | Lightweight data packets between nodes |
| Application | ESP-NOW (peer-to-peer) + UDP | Direct node-to-node messaging + dashboard forwarding |
| Data Format | JSON | Human-readable, matches existing `Zone`, `Node`, `AlertEvent` schemas (see `src/types.ts`) |

### 4.2 Mesh Topology — Fail-Safe Design

Nodes form a **redundant pair + client** mesh:

```
LANYARD (Client) ←→ RELAY A ←→ RELAY B
LANYARD (Client) ←→ RELAY B ←→ RELAY A
```

- Each relay maintains an ESP-NOW peer link to the other relay **and** to the lanyard badge.
- The lanyard broadcasts telemetry to **both** relays simultaneously (ESP-NOW supports up to 20 peers).
- If a relay goes offline, the lanyard detects the failure via missing ACKs and re-broadcasts to the remaining relay.
- Relays also sync state to each other: each relay sends the lanyard's readings plus its own sensor data to the other relay every 2 seconds, then both forward the unified dataset to the dashboard.
- This mirrors the web app's `MeshView.tsx` concept where a dropped relay causes a rerouted connection path, and the `dropNode`/`restoreNode` simulation functions model exactly this scenario.

### 4.3 Data Packet Format

Matches the existing `types.ts` contracts so the web app can consume hardware payloads directly:

```json
{
  "nodeId": "badge-001",
  "zoneId": "sjt",
  "densityScore": 87,
  "capacityThreshold": 85,
  "batteryLevel": 78,
  "connected": true,
  "timestamp": 1726001205,
  "status": "critical",
  "alerts": [
    {
      "type": "zone",
      "severity": "warning",
      "message": "SJT density reached CRITICAL (87/85)",
      "zoneId": "sjt"
    }
  ]
}
```

### 4.4 Dashboard Connection

Relay A acts as the primary gateway:
1. Runs a lightweight UDP server on port `8888`.
2. Receives data packets from the lanyard badge (via ESP-NOW bridge) and from Relay B.
3. Merges and deduplicates data using `nodeId + timestamp`.
4. The React dashboard (running on a laptop on the same LAN) subscribes via periodic HTTP GET (`/api/status`) or WebSockets for live updates.

**Fallback:** If Relay A is offline, Relay B promotes itself to gateway and opens the UDP server, mirroring the dashboard's "online/total nodes" indicator (`NodeHealthSummary.tsx`).

## 5. PCB Badge LED Mapping

The badge PCB has a silkscreen map of the VIT Vellore campus with designated building footprints. Each building has an embedded LED whose color maps directly to the `deriveStatus()` logic from `src/lib/status.ts`:

| Zone ID | Building | LED Color Mapping |
|---|---|---|
| `sjt` | Silver Jubilee Tower | Status-based (green→red per density) |
| `foodcourt` | Food Court | Status-based |
| `mainbuilding` | Main Building | Status-based |
| `tt` | Technology Tower | Status-based |
| `annaaud` | Anna Auditorium | Status-based |
| `library` | Library / Knowledge Park | Status-based |
| `gblock` | G-Block | Status-based |

The status color palette is inherited from the web app's CSS tokens in `src/index.css`:

```
Low:        #3F9A5D  (green)
Moderate:   #D9A82B  (amber)
High:       #DB8A2E  (orange)
Critical:   #C94A34  (red)
Emergency:  #C94A34  (red, pulse)
```

This matches exactly what `STATUS_COLOR` in `src/lib/status.ts` and the CSS variables `--color-status-*` render in `VenueMap.tsx` and the zone markers.

## 6. Data Flow

### 6.1 Normal Operation (All Online)

```
1. Lanyard badge samples:
   - IMU data (movement gesture)
   - BMP280 (altitude / floor change)
   - BLE scan for guardian proximity
   - Battery level
   - Current zone (manually set or GPS-less, based on last known position)

2. Badge computes deriveStatus() locally (same thresholds as web app):
   - densityScore = computed from IMU movement + BLE crowd density
   - status = ratio of densityScore / capacityThreshold

3. Badge broadcasts ESP-NOW packet to Relay A + Relay B:
   { nodeId, zoneId, densityScore, batteryLevel, status, alerts }

4. Relay A receives packet, adds its own sensors, forwards to dashboard:
   - Aggregates badge + relay + neighbor relay data

5. Relay B does the same (redundant path), syncs with Relay A every 2s

6. Dashboard receives UDP/HTTP, updates Zustand store:
   - Triggers StatusBadge updates, map recoloring, MeshView reroute animation
   - If emergency/critical → fires alert matching existing AlertEvent schema
```

### 6.2 Fail-Safe Operation (Relay A Offline)

```
1. Badge detects ACK failure from Relay A (ESP-NOW returns send fail)
2. Badge continues broadcasting — Relay B receives it
3. Relay B detects Relay A's silence via its own ACK check
4. Relay B promotes to gateway (broadcasts UDP server on port 8888)
5. Relay B forwards:
   - Lanyard data
   - Its own node data (battery, connectivity status)
   - Relay A's last known status (marked as disconnected)
6. Dashboard shows:
   - MeshView: Relay A node goes red with dashed reroute line to Relay B
   - NodeHealthSummary: 1/3 nodes online
   - Alerts: "Relay A dropped off the mesh — rerouting via Relay B"
```

### 6.3 Recovery (Relay A Returns)

```
1. Relay A boots, broadcasts ESP-NOW "hello" to known peers
2. Relay B ACKs and accepts Relay A back as a relay (not gateway)
3. Relay A signals it's back to the dashboard
4. MeshView: green connection line restored, reroute line disappears
5. NodeHealthSummary: 3/3 nodes online
6. Alerts: "Relay A reconnected to the mesh"
```

This mirrors the existing `dropNode` and `restoreNode` simulation triggers from `DemoControlPanel.tsx`, so the hardware demo and the web simulation stay in lockstep.

## 7. Software Architecture (Dashboard Side)

The existing React + Vite web app becomes the visualization layer over real hardware. No changes needed to the data model (`types.ts`, `lib/status.ts`, `lib/mockData.ts`, `lib/simulationStore.ts`).

### 7.1 Integration Points

The web app currently uses a client-side simulation (`simulationStore.ts`, 2.5s tick interval). To replace with live hardware:

**Option A — WebSocket (Preferred):**  
Relay A runs a WebSocket server. Dashboard replaces `tick()` calls with `onmessage()` handler that pushes payloads into the Zustand store.

**Option B — HTTP Polling:**  
Dashboard polls `GET /api/status` every 2.5s. Same store update path.

**Option C — UDP Bridge:**  
Relay A bridges ESP-NOW → UDP broadcast on `239.1.1.1:8888`. Dashboard needs a small Electron helper or local proxy script. (Most faithful to the "all nodes send data to each other" requirement.)

In all options, the existing component tree stays unchanged:

```
App.tsx
├── AppShell.tsx (layout, nav, node/wearable summary)
│   ├── Dashboard.tsx → VenueMap, NodeHealthSummary, AlertFeed, StatCards
│   ├── ZoneDetail.tsx → DensityChart, StatusBadge, node list
│   ├── Network.tsx → MeshView (SVG mesh with rerouting), AlertFeed
│   ├── Safety.tsx → WearableRow (safe / separated / SOS states)
│   ├── Analytics.tsx → BarChart, zone report table
│   ├── Settings.tsx → zone thresholds, wearable distances
│   └── Demo.tsx → DemoControlPanel (manual triggers)
```

The `DemoControlPanel.tsx` manual triggers map directly to hardware:
- `escalateZone("sjt")` → Badge increases reported density for SJT to 125% of threshold
- `dropNode("sjt-node-1")` → Simulate Relay A going offline (power switch on demo unit)
- `separateWearable("wearable-1")` → Move badge away from guardian's phone (BLE RSSI drops)
- `triggerSOS("wearable-1")` → Press the SOS button on the lanyard badge

### 7.2 What Stays the Same

| File | Role in Hardware Demo |
|---|---|
| `src/types.ts` | **Data contract** — hardware packets match `Zone`, `Node`, `AlertEvent`, `Wearable` schemas exactly |
| `src/lib/status.ts` | **Status logic** — badge ESP32 firmware must replicate `deriveStatus()` with the same ratios (1.15 → emergency, 1.0 → critical, 0.8 → high, 0.5 → moderate) |
| `src/lib/mockData.ts` | **Zone seed data** — VIT Vellore building names, IDs, and approximate lat/lng; firmware stores the same 7 zones |
| `src/components/dashboard/VenueMap.tsx` | **Dashboard map** — identical visual, now fed by real hardware data |
| `src/components/network/MeshView.tsx` | **Mesh visualizer** — same SVG rerouting-on-drop animation, now driven by real node connectivity |
| `src/components/demo/DemoControlPanel.tsx` | **Live demo sequence** — presenter triggers hardware scenarios that mirror the software simulation steps |

## 8. Firmware Tasks (ESP32)

### 8.1 Shared Libraries (Reusable Across All 3 ESP32s)

| Module | Description |
|---|---|
| `WifiManager` | Connects to VIT-WiFi; falls back to AP mode if unavailable |
| `MeshNetworkManager` | ESP-NOW peer management, packet serialization, ACK/retry logic |
| `StatusCalculator` | Port of `src/lib/status.ts#deriveStatus()` to C++ |
| `LedController` | WS2812B driver mapping zone → status color; supports pulsing for emergencies |
| `PowerManager` | Battery monitoring, low-power sleep between packets (100ms wake, 5s deep-sleep) |

### 8.2 Per-Node Responsibilities

**User Lanyard Badge (`badge-001`):**
- Reads IMU (MPU-6050) every 5s for movement detection
- Reads BMP280 for altitude change (detects floor transitions / stairs)
- Scans BLE for nearest guardian phone (RSSI → distanceMeters)
- Computes per-zone `densityScore` — for demo, this is simulated based on BLE scan results (proximity to other badges = crowd density)
- Sets LED colors per zone using the 7-LED VIT map
- Broadcasts ESP-NOW packet to Relay A + Relay B
- Button press → triggers SOS (sets status to "sos" in Wearable schema, distance to safeDistance + 15)

**Relay Node A (`relay-a`):**
- Receives ESP-NOW from badge
- Also runs BLE scan for additional badges (future expansion)
- Aggregates and forwards to dashboard via UDP/HTTP
- Syncs state to Relay B every 2s
- Promotes to gateway if Relay B is offline (and vice versa)

**Relay Node B (`relay-b`):**
- Same as Relay A, mirrored for redundancy
- Becomes gateway if Relay A is offline
- On recovery, defers back to Relay A

## 9. Fail-Safe & Redundancy Design

1. **Dual Radio Paths:** The lanyard badge transmits on **both** relay nodes simultaneously (ESP-NOW supports up to 20 peers). If one relay fails to ACK, the badge retries only to the other.

2. **State Sync:** Relays exchange their full node state every 2 seconds. The receiving relay merges and deduplicates. This ensures both relays always have a consistent view.

3. **Gateway Election:** Only one relay runs the UDP-to-dashboard bridge at a time. If the active gateway drops, the surviving relay detects the loss of heartbeat and starts its own UDP server. This is visible in `NodeHealthSummary.tsx` (online/total counter) and `MeshView.tsx` (green → dashed red reroute line).

4. **Dashboard Resilience:** The web app's `MeshView.tsx` already has the `connectedNeighbor(i)` function that finds an alternative path when a node is disconnected — this exact logic is implemented in firmware by each relay maintaining a neighbor list.

5. **SOS Persistence:** If the badge triggers SOS, the alert remains active and redisplayed until manually resolved (`resolveWearable` trigger in `DemoControlPanel.tsx`), even if the mesh briefly drops.

## 10. Demo Scenario Walkthrough

The hardware demo mirrors the `DemoControlPanel.tsx` scenario sequence:

| Step | Action (Hardware) | Web App Mirror |
|---|---|---|
| 1. Baseline | All 3 nodes powered on, badge LEDs green (low density), relays show "Connected" | `resetSimulation()` |
| 2. Escalate SJT | Press button on badge to simulate density spike — SJT LED pulses red | `escalateZone("sjt")` |
| 3. Drop Relay Node | Toggle power switch on Relay A — badge reroutes through Relay B | `dropNode("sjt-node-1")` |
| 4. Resolve SJT | Badge returns to normal density — SJT LED returns to green | `resolveZone("sjt")` + `restoreNode()` |
| 5. Separate Wearable | Move badge >25m from guardian's phone — "Separated" icon lights | `separateWearable("wearable-1")` |
| 6. Trigger SOS | Press SOS button on badge — LED flashes rapidly | `triggerSOS("wearable-1")` |

## 11. Bill of Materials (BOM)

| Item | Qty | Notes |
|---|---|---|
| ESP32-WROOM-32 | 3 | One per badge + 2 relays |
| 5000mAh LiPo battery | 1 | For lanyard badge |
| 18650 Li-ion cell | 2 | One per relay node |
| TP4056 charging board | 2 | For relay batteries |
| MPL3115A2 / BMP280 | 3 | Pressure / altitude sensor |
| MPU-6050 | 3 | IMU for movement detection |
| WS2812B LEDs (per building) | 7 | SJT, Food Court, Main Bldg, TT, Anna Aud, Library, G-Block |
| 0.96" OLED (SSD1306, I2C) | 3 | One per node |
| 10kΩ resistor | 6 | Button pull-ups |
| Tactile button (SOS) | 1 | On lanyard badge |
| Micro USB-C breakout | 3 | Charging / programming |
| JST PH 2.0 connector | 3 | Battery connection |

## 12. Development Phases

| Phase | Description | Time Estimate |
|---|---|---|
| P0: Firmware Base | ESP-NOW mesh + status computation on all 3 nodes | 2 days |
| P1: LED Mapping | Port silkscreen LEDs to status color codes | 1 day |
| P2: Dashboard Bridge | UDP/WebSocket bridge from Relay A to web app | 1 day |
| P3: Demo Sequence | Map DemoControlPanel triggers to physical actions | 1 day |
| P4: Fail-Safe Test | Verify relay drop/reconnect behavior matches MeshView | 1 day |

## 13. References

- **Data model:** `src/types.ts:1-47` — `Zone`, `Node`, `Wearable`, `AlertEvent`, `ZoneStatus`
- **Status logic:** `src/lib/status.ts:8-15` — `deriveStatus()` ratio thresholds
- **Color palette:** `src/index.css:13-22` — CSS status variables; `src/lib/status.ts:17-31` — `STATUS_COLOR`, `STATUS_BG`
- **Zone seed data:** `src/lib/mockData.ts:7-16` — 7 VIT Vellore zones with lat/lng
- **Simulation clock:** `src/lib/simulationStore.ts:6,75-177` — 2.5s tick, `dropNode`/`restoreNode` logic
- **Mesh visualization:** `src/components/network/MeshView.tsx:30-36` — `connectedNeighbor()` reroute logic
- **Demo triggers:** `src/components/demo/DemoControlPanel.tsx:40-77` — 6-step scenario sequence
- **Dashboard map:** `src/components/dashboard/VenueMap.tsx` — Leaflet markers with status colors
- **Live updates:** `src/main.tsx:8` — `startSimulationClock()` starts the 2.5s interval

## 14. Next Steps

1. **Firmware team:** Implement `MeshNetworkManager` (ESP-NOW peer layer) and `StatusCalculator` (port of `deriveStatus`).
2. **Hardware team:** Finalize PCB layout with 7 building LEDs positioned over silkscreen footprints, confirm LED count fits within ESP32 GPIO budget.
3. **Software team:** Add WebSocket/UDP input mode to `simulationStore.ts` to accept hardware payloads (bypass `tick()` in live mode).
4. **QA:** Build the demo scenario in `/demo` page to drive both the simulation and the physical hardware triggers.
