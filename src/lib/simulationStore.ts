import { create } from "zustand";
import type { AlertEvent, Node, Wearable, Zone, ZoneStatus } from "../types";
import { makeInitialNodes, makeInitialWearables, makeInitialZones } from "./mockData";
import { deriveStatus } from "./status";

const TICK_MS = 2500;
const MAX_TREND_POINTS = 40;
const MAX_ALERTS = 200;

interface HistoryPoint {
  timestamp: number;
  zoneId: string;
  densityScore: number;
  status: ZoneStatus;
}

interface SimulationState {
  zones: Zone[];
  nodes: Node[];
  wearables: Wearable[];
  alerts: AlertEvent[];
  history: HistoryPoint[];
  tickCount: number;
  running: boolean;

  tick: () => void;
  setRunning: (running: boolean) => void;
  pushAlert: (alert: Omit<AlertEvent, "id" | "timestamp">) => void;

  updateZoneThreshold: (zoneId: string, capacityThreshold: number) => void;
  renameZone: (zoneId: string, name: string) => void;
  repositionZone: (zoneId: string, position: { x: number; y: number }) => void;
  updateWearableSafeDistance: (wearableId: string, safeDistanceMeters: number) => void;

  escalateZone: (zoneId: string) => void;
  resolveZone: (zoneId: string) => void;
  dropNode: (nodeId: string) => void;
  restoreNode: (nodeId: string) => void;
  separateWearable: (wearableId: string) => void;
  triggerSOS: (wearableId: string) => void;
  resolveWearable: (wearableId: string) => void;
  resetSimulation: () => void;
}

let alertSeq = 0;
function nextAlertId() {
  alertSeq += 1;
  return `alert-${Date.now()}-${alertSeq}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildAlert(partial: Omit<AlertEvent, "id" | "timestamp">): AlertEvent {
  return { ...partial, id: nextAlertId(), timestamp: Date.now() };
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  zones: makeInitialZones(),
  nodes: [],
  wearables: makeInitialWearables(),
  alerts: [],
  history: [],
  tickCount: 0,
  running: true,

  pushAlert: (alert) =>
    set((state) => ({
      alerts: [buildAlert(alert), ...state.alerts].slice(0, MAX_ALERTS),
    })),

  setRunning: (running) => set({ running }),

  tick: () => {
    const state = get();
    const newAlerts: AlertEvent[] = [];
    const newHistory: HistoryPoint[] = [];
    const now = Date.now();

    const zones = state.zones.map((zone) => {
      const drift = (Math.random() - 0.48) * 9;
      const densityScore = clamp(Math.round(zone.densityScore + drift), 0, 130);
      const status = deriveStatus(densityScore, zone.capacityThreshold);
      const trend = [...zone.trend, densityScore].slice(-MAX_TREND_POINTS);

      if (status !== zone.status && (status === "critical" || status === "emergency")) {
        newAlerts.push(
          buildAlert({
            type: "zone",
            severity: status === "emergency" ? "critical" : "warning",
            message: `${zone.name} density reached ${status.toUpperCase()} (${densityScore}/${zone.capacityThreshold})`,
            zoneId: zone.id,
          }),
        );
      }

      newHistory.push({ timestamp: now, zoneId: zone.id, densityScore, status });

      return { ...zone, densityScore, status, trend };
    });

    const nodes = state.nodes.map((node) => {
      let { connected, lastSeenSeconds, batteryLevel } = node;

      if (connected && Math.random() < 0.015) {
        connected = false;
        newAlerts.push(
          buildAlert({
            type: "node",
            severity: "warning",
            message: `Node ${node.id} dropped off the mesh — rerouting via neighboring nodes`,
            zoneId: node.zoneId,
          }),
        );
      } else if (!connected && Math.random() < 0.35) {
        connected = true;
        lastSeenSeconds = 0;
        newAlerts.push(
          buildAlert({
            type: "node",
            severity: "info",
            message: `Node ${node.id} reconnected to the mesh`,
            zoneId: node.zoneId,
          }),
        );
      } else if (!connected) {
        lastSeenSeconds += TICK_MS / 1000;
      }

      batteryLevel = connected ? clamp(batteryLevel - Math.random() * 0.15, 0, 100) : batteryLevel;

      return { ...node, connected, lastSeenSeconds, batteryLevel };
    });

    const wearables = state.wearables.map((wearable) => {
      if (wearable.status === "sos") return wearable;

      let distanceMeters = clamp(
        wearable.distanceMeters + (Math.random() - 0.55) * 3,
        0.5,
        wearable.safeDistanceMeters * 1.8,
      );

      let status: Wearable["status"] = wearable.status;

      if (wearable.status === "safe" && Math.random() < 0.02) {
        distanceMeters = wearable.safeDistanceMeters + 3 + Math.random() * 6;
      }

      if (distanceMeters > wearable.safeDistanceMeters) {
        if (status !== "separated") {
          newAlerts.push(
            buildAlert({
              type: "wearable",
              severity: "warning",
              message: `${wearable.childName} moved ${distanceMeters.toFixed(0)}m from ${wearable.guardianName} — outside safe range`,
            }),
          );
        }
        status = "separated";
      } else {
        status = "safe";
      }

      return { ...wearable, distanceMeters, status };
    });

    set({
      zones,
      nodes,
      wearables,
      tickCount: state.tickCount + 1,
      alerts: newAlerts.length ? [...newAlerts, ...state.alerts].slice(0, MAX_ALERTS) : state.alerts,
      history: [...state.history, ...newHistory].slice(-MAX_TREND_POINTS * zones.length),
    });
  },

  updateZoneThreshold: (zoneId, capacityThreshold) =>
    set((state) => ({
      zones: state.zones.map((z) =>
        z.id === zoneId
          ? { ...z, capacityThreshold, status: deriveStatus(z.densityScore, capacityThreshold) }
          : z,
      ),
    })),

  renameZone: (zoneId, name) =>
    set((state) => ({ zones: state.zones.map((z) => (z.id === zoneId ? { ...z, name } : z)) })),

  repositionZone: (zoneId, position) =>
    set((state) => ({ zones: state.zones.map((z) => (z.id === zoneId ? { ...z, position } : z)) })),

  updateWearableSafeDistance: (wearableId, safeDistanceMeters) =>
    set((state) => ({
      wearables: state.wearables.map((w) => (w.id === wearableId ? { ...w, safeDistanceMeters } : w)),
    })),

  escalateZone: (zoneId) =>
    set((state) => {
      const zones = state.zones.map((z) => {
        if (z.id !== zoneId) return z;
        const densityScore = Math.round(z.capacityThreshold * 1.25);
        return { ...z, densityScore, status: deriveStatus(densityScore, z.capacityThreshold) };
      });
      const zone = zones.find((z) => z.id === zoneId);
      return {
        zones,
        alerts: zone
          ? [
              buildAlert({
                type: "zone",
                severity: "critical",
                message: `${zone.name} manually escalated to EMERGENCY density`,
                zoneId,
              }),
              ...state.alerts,
            ].slice(0, MAX_ALERTS)
          : state.alerts,
      };
    }),

  resolveZone: (zoneId) =>
    set((state) => {
      const zones = state.zones.map((z) => {
        if (z.id !== zoneId) return z;
        const densityScore = Math.round(z.capacityThreshold * 0.35);
        return { ...z, densityScore, status: deriveStatus(densityScore, z.capacityThreshold) };
      });
      const zone = zones.find((z) => z.id === zoneId);
      return {
        zones,
        alerts: zone
          ? [
              buildAlert({
                type: "zone",
                severity: "info",
                message: `${zone.name} resolved back to a safe density level`,
                zoneId,
              }),
              ...state.alerts,
            ].slice(0, MAX_ALERTS)
          : state.alerts,
      };
    }),

  dropNode: (nodeId) =>
    set((state) => {
      const nodes = state.nodes.map((n) => (n.id === nodeId ? { ...n, connected: false, lastSeenSeconds: 0 } : n));
      const node = nodes.find((n) => n.id === nodeId);
      return {
        nodes,
        alerts: node
          ? [
              buildAlert({
                type: "node",
                severity: "warning",
                message: `Node ${nodeId} manually dropped — mesh rerouting around it`,
                zoneId: node.zoneId,
              }),
              ...state.alerts,
            ].slice(0, MAX_ALERTS)
          : state.alerts,
      };
    }),

  restoreNode: (nodeId) =>
    set((state) => {
      const nodes = state.nodes.map((n) => (n.id === nodeId ? { ...n, connected: true, lastSeenSeconds: 0 } : n));
      const node = nodes.find((n) => n.id === nodeId);
      return {
        nodes,
        alerts: node
          ? [
              buildAlert({
                type: "node",
                severity: "info",
                message: `Node ${nodeId} restored to the mesh`,
                zoneId: node.zoneId,
              }),
              ...state.alerts,
            ].slice(0, MAX_ALERTS)
          : state.alerts,
      };
    }),

  separateWearable: (wearableId) =>
    set((state) => {
      const wearables = state.wearables.map((w) =>
        w.id === wearableId
          ? { ...w, distanceMeters: w.safeDistanceMeters + 8, status: "separated" as const }
          : w,
      );
      const wearable = wearables.find((w) => w.id === wearableId);
      return {
        wearables,
        alerts: wearable
          ? [
              buildAlert({
                type: "wearable",
                severity: "warning",
                message: `${wearable.childName} manually separated from ${wearable.guardianName}`,
              }),
              ...state.alerts,
            ].slice(0, MAX_ALERTS)
          : state.alerts,
      };
    }),

  triggerSOS: (wearableId) =>
    set((state) => {
      const wearables = state.wearables.map((w) =>
        w.id === wearableId ? { ...w, status: "sos" as const, distanceMeters: w.safeDistanceMeters + 15 } : w,
      );
      const wearable = wearables.find((w) => w.id === wearableId);
      return {
        wearables,
        alerts: wearable
          ? [
              buildAlert({
                type: "wearable",
                severity: "critical",
                message: `SOS triggered for ${wearable.childName} — guardian ${wearable.guardianName} notified`,
              }),
              ...state.alerts,
            ].slice(0, MAX_ALERTS)
          : state.alerts,
      };
    }),

  resolveWearable: (wearableId) =>
    set((state) => ({
      wearables: state.wearables.map((w) =>
        w.id === wearableId ? { ...w, status: "safe" as const, distanceMeters: 4 } : w,
      ),
    })),

  resetSimulation: () => {
    const zones = makeInitialZones();
    set({
      zones,
      nodes: makeInitialNodes(zones),
      wearables: makeInitialWearables(),
      alerts: [],
      history: [],
      tickCount: 0,
    });
  },
}));

useSimulationStore.setState((state) => ({ nodes: makeInitialNodes(state.zones) }));

let intervalHandle: ReturnType<typeof setInterval> | undefined;
export function startSimulationClock() {
  if (intervalHandle) return;
  intervalHandle = setInterval(() => {
    if (useSimulationStore.getState().running) {
      useSimulationStore.getState().tick();
    }
  }, TICK_MS);
}
