import { useState } from "react";
import { useSimulationStore } from "../../lib/simulationStore";

const STAGE_ZONE_ID = "sjt";
const RELAY_NODE_ID = "sjt-node-1";
const SOS_WEARABLE_ID = "wearable-1";

interface Step {
  label: string;
  description: string;
  run: () => void;
}

export function DemoControlPanel() {
  const [running, setLocalRunning] = useState(false);
  const {
    resetSimulation,
    escalateZone,
    resolveZone,
    dropNode,
    restoreNode,
    separateWearable,
    triggerSOS,
    resolveWearable,
    running: clockRunning,
    setRunning,
    wearables,
    nodes,
  } = useSimulationStore();

  const relayNode = nodes.find((n) => n.id === RELAY_NODE_ID) ?? nodes[0];
  const sosWearable = wearables.find((w) => w.id === SOS_WEARABLE_ID) ?? wearables[0];

  const steps: Step[] = [
    {
      label: "1. Baseline",
      description: "Reset the simulation to a calm, normal state.",
      run: () => {
        resetSimulation();
        wearables.forEach((w) => resolveWearable(w.id));
      },
    },
    {
      label: "2. Escalate SJT",
      description: "Push SJT (Silver Jubilee Tower) density into EMERGENCY.",
      run: () => escalateZone(STAGE_ZONE_ID),
    },
    {
      label: "3. Drop Relay Node",
      description: "Simulate a mesh node going offline mid-event.",
      run: () => relayNode && dropNode(relayNode.id),
    },
    {
      label: "4. Resolve SJT",
      description: "Bring SJT density back to a safe level.",
      run: () => {
        resolveZone(STAGE_ZONE_ID);
        relayNode && restoreNode(relayNode.id);
      },
    },
    {
      label: "5. Separate Wearable",
      description: "Move a child's wearable outside the safe distance.",
      run: () => sosWearable && separateWearable(sosWearable.id),
    },
    {
      label: "6. Trigger SOS",
      description: "Fire an SOS alert for the guardian to see.",
      run: () => sosWearable && triggerSOS(sosWearable.id),
    },
  ];

  const runFullSequence = async () => {
    setLocalRunning(true);
    for (const step of steps) {
      step.run();
      await new Promise((resolve) => setTimeout(resolve, 1400));
    }
    setLocalRunning(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Demo Control</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Drive the dashboard live for a pitch instead of waiting on random simulation events.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={runFullSequence}
          disabled={running}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {running ? "Running sequence…" : "Run Full Sequence"}
        </button>
        <button
          type="button"
          onClick={() => setRunning(!clockRunning)}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-bg"
        >
          {clockRunning ? "Pause Background Simulation" : "Resume Background Simulation"}
        </button>
        <button
          type="button"
          onClick={() => resetSimulation()}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-bg"
        >
          Reset to Baseline
        </button>
      </div>

      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {steps.map((step) => (
          <li key={step.label} className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
            <p className="text-sm font-semibold text-ink">{step.label}</p>
            <p className="text-xs text-ink-muted">{step.description}</p>
            <button
              type="button"
              onClick={step.run}
              disabled={running}
              className="mt-auto self-start rounded-md border border-accent px-3 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-white disabled:opacity-50"
            >
              Run step
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
