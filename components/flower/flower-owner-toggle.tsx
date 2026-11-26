"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        aria-pressed={isOwned}
        aria-label={isOwned ? "Bỏ tick hoa này" : "Tick hoa này"}
        title={disabled ? "Chọn thành viên để tick hoa" : undefined}
        disabled={disabled || pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              const result = await toggleFlowerOwnerAction(flowerId);

              if (result.status === "error") {
                if (result.code === "UNAUTHENTICATED") {
                  router.push("/login");
                  return;
                }

                setError(result.message);

                if (result.code === "NO_MEMBER" || result.code === "FORBIDDEN") {
                  router.refresh();
                }
              }
            } catch {
              setError("Không thể cập nhật hoa lúc này. Vui lòng thử lại.");
            }
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
      {error ? (
        <p role="alert" className="text-right text-[11px] font-medium text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
