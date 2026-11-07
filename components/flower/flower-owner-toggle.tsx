"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { cn } from "cn";

import { toggleFlowerOwnerAction } from "@/app/actions/flower-owner";

export function FlowerOwnerToggle({
  flowerId,
  isOwned,
  disabled,
}: {
  flowerId: string;
  isOwned: boolean;
  disabled: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-pressed={isOwned}
      aria-label={isOwned ? "Bỏ tick hoa này" : "Tick hoa này"}
      title={disabled ? "Chọn thành viên để tick hoa" : undefined}
      disabled={disabled || pending}
      onClick={() => {
        startTransition(async () => {
          await toggleFlowerOwnerAction(flowerId);
        });
      }}
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
        isOwned
          ? "border-rose-600 bg-rose-600 text-white"
          : "border-rose-200 bg-white text-rose-400 hover:border-rose-400 hover:text-rose-500",
        (disabled || pending) && "opacity-50",
      )}
    >
      <Check aria-hidden="true" className="size-3.5" />
    </button>
  );
}
