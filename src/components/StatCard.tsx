import type { ComponentType } from "react";

type Tone = "default" | "alert" | "copper" | "safe";

const TONE_CLASSES: Record<Tone, string> = {
  default: "bg-status-low-bg text-status-low",
  alert: "bg-status-critical-bg text-status-critical",
  copper: "bg-accent/10 text-accent",
  safe: "bg-status-low-bg text-status-low",
};

interface StatCardProps {
  label: string;
  value: string;
  detail: string;
  icon: ComponentType<{ size?: number }>;
  tone?: Tone;
}

export function StatCard({ label, value, detail, icon: Icon, tone = "default" }: StatCardProps) {
  return (
    <div className="card flex min-h-[104px] items-start gap-3.5 p-5">
      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${TONE_CLASSES[tone]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="mb-1 text-sm text-ink-muted">{label}</p>
        <strong className="block font-heading text-[28px] leading-none tracking-tight text-ink">{value}</strong>
        <small className="mt-1.5 block text-xs text-ink-muted/90">{detail}</small>
      </div>
    </div>
  );
}
