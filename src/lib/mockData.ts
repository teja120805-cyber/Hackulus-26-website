import type { Node, Wearable, Zone } from "../types";
import { deriveStatus } from "./status";

// Approximate building locations on the VIT Vellore campus (Katpadi, Tamil Nadu),
// centered on the real campus at ~12.9692 N, 79.1559 E. Placements are best-effort
// approximations for demo purposes, not surveyed GPS footprints.
export function makeInitialZones(): Zone[] {
  const seed: Array<Pick<Zone, "id" | "name" | "position" | "densityScore" | "capacityThreshold">> = [
    { id: "sjt", name: "SJT (Silver Jubilee Tower)", position: { lat: 12.9707, lng: 79.1567 }, densityScore: 62, capacityThreshold: 85 },
    { id: "foodcourt", name: "Food Court", position: { lat: 12.9682, lng: 79.1553 }, densityScore: 41, capacityThreshold: 80 },
    { id: "mainbuilding", name: "Main Building", position: { lat: 12.9698, lng: 79.156 }, densityScore: 33, capacityThreshold: 75 },
    { id: "tt", name: "TT (Technology Tower)", position: { lat: 12.9715, lng: 79.155 }, densityScore: 18, capacityThreshold: 70 },
    { id: "annaaud", name: "Anna Auditorium", position: { lat: 12.969, lng: 79.1544 }, densityScore: 47, capacityThreshold: 80 },
    { id: "library", name: "Library (Knowledge Park)", position: { lat: 12.9703, lng: 79.1575 }, densityScore: 29, capacityThreshold: 70 },
    { id: "gblock", name: "G Block", position: { lat: 12.9688, lng: 79.1568 }, densityScore: 55, capacityThreshold: 90 },
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
