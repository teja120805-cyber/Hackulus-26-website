import { useMemo } from "react";
import { Radio, X, Zap } from "lucide-react";
import type { Node } from "../../types";
import { useSimulationStore } from "../../lib/simulationStore";

interface MeshViewProps {
  nodes: Node[];
}

const CENTER = { x: 300, y: 220 };
const RADIUS = 170;

export function MeshView({ nodes }: MeshViewProps) {
  const dropNode = useSimulationStore((s) => s.dropNode);
  const restoreNode = useSimulationStore((s) => s.restoreNode);

  const positioned = useMemo(
    () =>
      nodes.map((node, i) => {
        const angle = (i / Math.max(nodes.length, 1)) * Math.PI * 2 - Math.PI / 2;
        return {
          node,
          x: CENTER.x + Math.cos(angle) * RADIUS,
          y: CENTER.y + Math.sin(angle) * RADIUS,
        };
      }),
    [nodes],
  );

  const connectedNeighbor = (index: number) => {
    for (let offset = 1; offset < positioned.length; offset++) {
      const candidate = positioned[(index + offset) % positioned.length];
      if (candidate.node.connected) return candidate;
    }
    return null;
  };

  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="eyebrow">Mesh Topology</p>
          <h2 className="mt-0.5 font-heading text-base font-semibold text-ink">Self-healing network</h2>
        </div>
        <Zap size={16} className="text-accent" />
      </div>
      <svg viewBox="0 0 600 440" className="w-full" role="img" aria-label="Mesh network topology">
        <circle cx={CENTER.x} cy={CENTER.y} r={26} fill="#22261f" />
        <text x={CENTER.x} y={CENTER.y + 4} textAnchor="middle" fontSize="10" fill="#fff" fontWeight={600}>
          HUB
        </text>

        {positioned.map(({ node, x, y }, i) => {
          if (node.connected) {
            return (
              <line
                key={`line-${node.id}`}
                x1={CENTER.x}
                y1={CENTER.y}
                x2={x}
                y2={y}
                stroke="#3f9a5d"
                strokeWidth={2}
              />
            );
          }
          const neighbor = connectedNeighbor(i);
          if (!neighbor) {
            return (
              <line
                key={`line-${node.id}`}
                x1={CENTER.x}
                y1={CENTER.y}
                x2={x}
                y2={y}
                stroke="#c94a34"
                strokeDasharray="4 4"
                strokeWidth={2}
              />
            );
          }
          return (
            <g key={`line-${node.id}`}>
              <line x1={x} y1={y} x2={neighbor.x} y2={neighbor.y} stroke="#d9a82b" strokeDasharray="3 3" strokeWidth={2} />
              <line x1={neighbor.x} y1={neighbor.y} x2={CENTER.x} y2={CENTER.y} stroke="#d9a82b" strokeWidth={1} opacity={0.5} />
            </g>
          );
        })}

        {positioned.map(({ node, x, y }) => (
          <g key={node.id}>
            <circle
              cx={x}
              cy={y}
              r={16}
              fill={node.connected ? "#eaf5ec" : "#fae4e0"}
              stroke={node.connected ? "#3f9a5d" : "#c94a34"}
              strokeWidth={2}
              className={node.connected ? undefined : "status-pulse"}
            />
            <text x={x} y={y + 3} textAnchor="middle" fontSize="9" fill="#22261f" fontWeight={600}>
              {Math.round(node.batteryLevel)}
            </text>
            <text x={x} y={y + 30} textAnchor="middle" fontSize="9" fill="#6b7268">
              {node.id}
            </text>
          </g>
        ))}
      </svg>

      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {nodes.map((node) => (
          <li
            key={node.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
                  node.connected ? "bg-status-low-bg text-status-low" : "bg-status-critical-bg text-status-critical"
                }`}
              >
                {node.connected ? <Radio size={14} /> : <X size={14} />}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{node.id}</p>
                <p className="truncate text-xs text-ink-muted">
                  {node.connected ? "Connected" : `Offline ${Math.round(node.lastSeenSeconds)}s — rerouted`} ·{" "}
                  {Math.round(node.batteryLevel)}%
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => (node.connected ? dropNode(node.id) : restoreNode(node.id))}
              className="shrink-0 rounded-md border border-accent px-2 py-1 text-xs font-medium text-accent hover:bg-accent hover:text-white"
            >
              {node.connected ? "Drop" : "Restore"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
