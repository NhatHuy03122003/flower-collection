import { ImageIcon } from "lucide-react";

import type { GuideStep } from "@/lib/guide-content";

export function GuideStepBody({ step }: { step: GuideStep }) {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-slate-600">{step.summary}</p>

      <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
        {step.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ol>

      {step.note ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50/70 px-3.5 py-2.5 text-xs leading-relaxed font-medium text-rose-900">
          {step.note}
        </p>
      ) : null}

      {step.screenshotPath ? (
        <div className="overflow-hidden rounded-xl border border-rose-200 bg-white">
          <img
            src={step.screenshotPath.replace(/^public/, "")}
            alt={step.screenshotLabel}
            className="h-auto w-full object-contain"
          />
          <p className="px-3 py-2 text-center text-xs text-slate-500">
            {step.screenshotLabel}
          </p>
        </div>
      ) : null}
    </div>
  );
}
