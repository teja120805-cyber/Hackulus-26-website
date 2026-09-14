export type ZoneStatus = "low" | "moderate" | "high" | "critical" | "emergency";

export interface Zone {
  id: string;
  name: string;
  position: { lat: number; lng: number }; // real-world coordinates, for placing on the OpenStreetMap venue map
  densityScore: number; // 0-100
  capacityThreshold: number; // organizer-configurable, per zone
  status: ZoneStatus;
  trend: number[]; // recent density history for sparkline/chart
}

export interface Node {
  id: string;
  zoneId: string;
  batteryLevel: number; // 0-100
  connected: boolean;
  lastSeenSeconds: number;
}

export interface Wearable {
  id: string;
  childName: string;
  guardianName: string;
  distanceMeters: number;
  safeDistanceMeters: number;
  status: "safe" | "separated" | "sos";
}

export interface AlertEvent {
  id: string;
  type: "zone" | "node" | "wearable";
  severity: "info" | "warning" | "critical";
  message: string;
  timestamp: number;
  zoneId?: string;
}

export const STATUS_ORDER: ZoneStatus[] = ["low", "moderate", "high", "critical", "emergency"];

export const STATUS_LABEL: Record<ZoneStatus, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  critical: "Critical",
  emergency: "Emergency",
};
