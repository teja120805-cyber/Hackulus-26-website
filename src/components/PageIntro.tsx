import type { ReactNode } from "react";

interface PageIntroProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}

export function PageIntro({ eyebrow, title, description, action, compact = false }: PageIntroProps) {
  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${compact ? "sm:items-center" : ""}`}
    >
      <div>
        <p className="eyebrow text-accent">{eyebrow}</p>
        <h2
          className={`mt-2 font-heading font-semibold leading-[1.05] tracking-tight text-ink ${
            compact ? "text-2xl" : "text-[2rem] sm:text-4xl"
          }`}
        >
          {title}
        </h2>
        {description && <p className="mt-2 max-w-lg text-sm text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
