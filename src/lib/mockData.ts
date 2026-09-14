import type { Node, Wearable, Zone } from "../types";
import { deriveStatus } from "./status";

export function makeInitialZones(): Zone[] {
  const seed: Array<Pick<Zone, "id" | "name" | "position" | "densityScore" | "capacityThreshold">> = [
    { id: "stage", name: "Main Stage", position: { x: 0.5, y: 0.18 }, densityScore: 62, capacityThreshold: 85 },
    { id: "food-court", name: "Food Court", position: { x: 0.78, y: 0.42 }, densityScore: 41, capacityThreshold: 80 },
    { id: "entrance", name: "Main Entrance", position: { x: 0.5, y: 0.92 }, densityScore: 33, capacityThreshold: 75 },
    { id: "exit-north", name: "North Exit", position: { x: 0.12, y: 0.1 }, densityScore: 18, capacityThreshold: 70 },
    { id: "merch", name: "Merch Tent", position: { x: 0.22, y: 0.55 }, densityScore: 47, capacityThreshold: 80 },
    { id: "restrooms", name: "Restrooms", position: { x: 0.85, y: 0.75 }, densityScore: 29, capacityThreshold: 70 },
    { id: "vip", name: "VIP Lounge", position: { x: 0.68, y: 0.15 }, densityScore: 55, capacityThreshold: 90 },
  ];

  return seed.map((z) => ({
    ...z,
    status: deriveStatus(z.densityScore, z.capacityThreshold),
    trend: Array.from({ length: 20 }, () => Math.max(0, z.densityScore + (Math.random() * 10 - 5))),
  }));
}

export function makeInitialNodes(zones: Zone[]): Node[] {
  const nodes: Node[] = [];
  for (const zone of zones) {
    const nodeCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        id: `${zone.id}-node-${i + 1}`,
        zoneId: zone.id,
        batteryLevel: 60 + Math.floor(Math.random() * 40),
        connected: true,
        lastSeenSeconds: 0,
      });
    }
  }
  return nodes;
}

const CHILD_GUARDIAN_PAIRS: Array<{ childName: string; guardianName: string }> = [
  { childName: "Maya P.", guardianName: "Priya P." },
  { childName: "Leo K.", guardianName: "Daniel K." },
  { childName: "Ava R.", guardianName: "Sofia R." },
  { childName: "Noah T.", guardianName: "James T." },
  { childName: "Zoe M.", guardianName: "Amara M." },
];

export function makeInitialWearables(): Wearable[] {
  return CHILD_GUARDIAN_PAIRS.map((pair, i) => ({
    id: `wearable-${i + 1}`,
    ...pair,
    distanceMeters: 4 + Math.random() * 8,
    safeDistanceMeters: 25,
    status: "safe",
  }));
}
