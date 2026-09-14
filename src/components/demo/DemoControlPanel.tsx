import { useState } from "react";
import { Check, Play, Zap } from "lucide-react";
import { useSimulationStore } from "../../lib/simulationStore";
import { StatusBadge } from "../StatusBadge";
import { PageIntro } from "../PageIntro";

const STAGE_ZONE_ID = "sjt";
const RELAY_NODE_ID = "sjt-node-1";
const SOS_WEARABLE_ID = "wearable-1";

interface Step {
  label: string;
  description: string;
  run: () => void;
}

export function DemoControlPanel() {
  const [step, setStep] = useState(0);
  const [autoPlaying, setAutoPlaying] = useState(false);
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
    zones,
  } = useSimulationStore();

  const relayNode = nodes.find((n) => n.id === RELAY_NODE_ID) ?? nodes[0];
  const sosWearable = wearables.find((w) => w.id === SOS_WEARABLE_ID) ?? wearables[0];
  const stageZone = zones.find((z) => z.id === STAGE_ZONE_ID);

  const steps: Step[] = [
    {
      label: "Baseline",
      description: "Reset the simulation to a calm, normal state.",
      run: () => {
        resetSimulation();
        wearables.forEach((w) => resolveWearable(w.id));
      },
    },
    {
      label: "Escalate SJT",
      description: "Push SJT (Silver Jubilee Tower) density into EMERGENCY.",
      run: () => escalateZone(STAGE_ZONE_ID),
    },
    {
      label: "Drop Relay Node",
      description: "Simulate a mesh node going offline mid-event.",
      run: () => relayNode && dropNode(relayNode.id),
    },
    {
      label: "Resolve SJT",
      description: "Bring SJT density back to a safe level.",
      run: () => {
        resolveZone(STAGE_ZONE_ID);
        relayNode && restoreNode(relayNode.id);
      },
    },
    {
      label: "Separate Wearable",
      description: "Move a child's wearable outside the safe distance.",
      run: () => sosWearable && separateWearable(sosWearable.id),
    },
    {
      label: "Trigger SOS",
      description: "Fire an SOS alert for the guardian to see.",
      run: () => sosWearable && triggerSOS(sosWearable.id),
    },
  ];

  const runStepAt = (index: number) => {
    steps[index].run();
    setStep(index + 1);
  };

  const runFullSequence = async () => {
    setAutoPlaying(true);
    for (let i = 0; i < steps.length; i++) {
      steps[i].run();
      setStep(i + 1);
      await new Promise((resolve) => setTimeout(resolve, 1400));
    }
    setAutoPlaying(false);
  };

  const resetDemo = () => {
    resetSimulation();
    wearables.forEach((w) => resolveWearable(w.id));
    setStep(0);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageIntro
        eyebrow="Presentation Mode"
        title="Demo control room."
        description="Drive the live simulation from baseline to response."
        compact
        action={
          <div className="flex items-center gap-2 rounded-lg border border-[#d6e8d8] px-3.5 py-2.5 text-sm text-status-low">
            <span className="h-1.5 w-1.5 rounded-full bg-status-low" />
            Simulation running
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={runFullSequence} disabled={autoPlaying} className="btn-primary disabled:opacity-50">
          <Play size={16} />
          {autoPlaying ? "Running sequence…" : "Run Full Sequence"}
        </button>
        <button type="button" onClick={() => setRunning(!clockRunning)} className="btn-outline">
          {clockRunning ? "Pause Background Simulation" : "Resume Background Simulation"}
        </button>
        <button type="button" onClick={resetDemo} className="btn-outline">
          Reset to Baseline
        </button>
      </div>

      <section className="card p-7">
        <div className="mb-10 flex items-start">
          {steps.map((s, index) => {
            const complete = index < step;
            const active = index === step;
            return (
              <div key={s.label} className="relative flex flex-1 flex-col items-center gap-2 text-center">
                <div
                  className={`z-10 grid h-9 w-9 place-items-center rounded-full border font-mono text-sm ${
                    complete
                      ? "border-[#b7d8bc] bg-status-low-bg text-status-low"
                      : active
                        ? "border-accent bg-accent text-white"
                        : "border-[#d8d5cc] bg-white text-[#aaa]"
                  }`}
                >
                  {complete ? <Check size={16} /> : index + 1}
                </div>
                <span className={`text-xs ${complete || active ? "text-ink" : "text-[#aaa]"}`}>{s.label}</span>
                {index < steps.length - 1 && (
                  <i
                    className={`absolute left-1/2 top-[18px] h-px w-full ${
                      complete ? "bg-[#b7d8bc]" : "bg-[#e6e3da]"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mx-auto max-w-[32rem] text-center">
          <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-accent/10 text-accent">
            <Play size={34} />
          </div>
          <h3 className="font-heading text-2xl font-semibold text-ink">
            {step === 0 ? "Ready when you are" : step >= steps.length ? "Scenario complete" : steps[step].label}
          </h3>
          <p className="mx-auto mt-2 mb-5 text-base leading-relaxed text-ink-muted">
            {step === 0
              ? "Use the guided sequence to show how CrowdSense turns sensor signals into clear action."
              : step >= steps.length
                ? "Reset the scenario and run it again for another audience."
                : steps[step].description}
          </p>
          {step < steps.length ? (
            <button type="button" onClick={() => runStepAt(step)} disabled={autoPlaying} className="btn-primary disabled:opacity-50">
              {step === 0 ? "Start scenario" : `Run: ${steps[step].label}`}
            </button>
          ) : (
            <button type="button" onClick={resetDemo} className="btn-outline">
              Reset scenario
            </button>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <p className="eyebrow">Current State</p>
          <h2 className="mt-0.5 mb-3 font-heading text-lg font-semibold text-ink">What the app is seeing</h2>
          <div className="flex items-center justify-between border-b border-[#efede7] py-3.5 text-base">
            <span className="text-ink-muted">SJT</span>
            {stageZone && <StatusBadge status={stageZone.status} size="sm" />}
          </div>
          <div className="flex items-center justify-between border-b border-[#efede7] py-3.5 text-base">
            <span className="text-ink-muted">Relay {relayNode?.id ?? "—"}</span>
            <b className={relayNode?.connected ? "text-status-low" : "text-status-critical"}>
              {relayNode?.connected ? "Connected" : "Rerouting"}
            </b>
          </div>
          <div className="flex items-center justify-between py-3.5 text-base">
            <span className="text-ink-muted">{sosWearable?.childName ?? "—"}</span>
            <b className={sosWearable?.status === "safe" ? "text-status-low" : "text-status-critical"}>
              {sosWearable?.status === "safe" ? "Safe" : sosWearable?.status === "sos" ? "SOS active" : "Separated"}
            </b>
          </div>
        </section>

        <section className="card flex flex-col gap-3 bg-[#292d26] p-6 text-white">
          <Zap size={24} className="text-[#d3a362]" />
          <h3 className="font-heading text-lg font-semibold text-white">The wow moment</h3>
          <p className="text-base leading-relaxed text-[#b2b7ad]">
            Open the map, network, and safety views in separate tabs while you run the sequence. Every screen shares
            the same live state.
          </p>
        </section>
      </div>
    </div>
  );
}
