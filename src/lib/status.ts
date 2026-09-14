import type { ZoneStatus } from "../types";

/**
 * Maps a zone's densityScore against its organizer-configured capacityThreshold
 * into one of the five status tiers, expressed as a ratio so each zone's alert
 * point stays meaningful even as organizers tune capacity per zone.
 */
export function deriveStatus(densityScore: number, capacityThreshold: number): ZoneStatus {
  const ratio = densityScore / capacityThreshold;
  if (ratio >= 1.15) return "emergency";
  if (ratio >= 1.0) return "critical";
  if (ratio >= 0.8) return "high";
  if (ratio >= 0.5) return "moderate";
  return "low";
}

export const STATUS_COLOR: Record<ZoneStatus, string> = {
  low: "#3F9A5D",
  moderate: "#D9A82B",
  high: "#DB8A2E",
  critical: "#C94A34",
  emergency: "#C94A34",
};

export const STATUS_BG: Record<ZoneStatus, string> = {
  low: "#EAF5EC",
  moderate: "#FBF3DE",
  high: "#FBEBDA",
  critical: "#FAE4E0",
  emergency: "#F6D3CC",
};
