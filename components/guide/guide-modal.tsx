"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FAQ_ITEMS, GUIDE_STEPS } from "@/lib/guide-content";

import { GuideStepBody } from "./guide-step-body";

export function GuideModal() {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [showFaq, setShowFaq] = useState(false);

  const totalSteps = GUIDE_STEPS.length;
  const currentStep = GUIDE_STEPS[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setStepIndex(0);
      setShowFaq(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          />
        }
      >
        Xem hướng dẫn sử dụng →
      </DialogTrigger>

      <DialogContent className="flex max-h-[90dvh] w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden rounded-2xl border border-rose-200/80 bg-white p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-rose-100 bg-[#fff8fa] px-5 py-4 pr-12">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full bg-rose-600 px-2.5 text-xs font-semibold text-white">
              {showFaq ? "FAQ" : `Bước ${stepIndex + 1}/${totalSteps}`}
            </Badge>
            <DialogTitle className="text-base font-bold text-rose-950">
              {showFaq ? "Câu hỏi thường gặp" : currentStep.title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-rose-900/70">
            Hướng dẫn sử dụng Hội ROSE Flower Collection
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {GUIDE_STEPS.map((step, index) => {
              const active = !showFaq && index === stepIndex;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    setShowFaq(false);
                    setStepIndex(index);
                  }}
                  aria-label={`Chuyển đến bước ${step.number}`}
                  aria-current={active ? "step" : undefined}
                  className={
                    active
                      ? "inline-flex h-7 items-center rounded-full bg-rose-600 px-2.5 text-xs font-semibold text-white"
                      : "inline-flex h-7 items-center rounded-full border border-rose-200 bg-rose-50/70 px-2.5 text-xs font-medium text-rose-900 hover:bg-rose-100"
                  }
                >
                  Bước {step.number}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setShowFaq(true)}
              aria-current={showFaq ? "page" : undefined}
              className={
                showFaq
                  ? "inline-flex h-7 items-center gap-1 rounded-full bg-rose-600 px-2.5 text-xs font-semibold text-white"
                  : "inline-flex h-7 items-center gap-1 rounded-full border border-rose-200 bg-rose-50/70 px-2.5 text-xs font-medium text-rose-900 hover:bg-rose-100"
              }
            >
              <HelpCircle aria-hidden="true" className="size-3.5" />
              FAQ
            </button>
          </div>

          {showFaq ? (
            <div className="space-y-2.5">
              {FAQ_ITEMS.map((item) => (
                <div
                  key={item.question}
                  className="rounded-xl border border-rose-200/80 bg-rose-50/40 p-3.5"
                >
                  <h3 className="text-sm font-semibold text-rose-950">
                    {item.question}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <GuideStepBody step={currentStep} />
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 flex-row items-center justify-between gap-2 rounded-b-2xl border-t border-rose-100 bg-[#fff8fa] px-5 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
          >
            Đóng
          </Button>

          {showFaq ? (
            <Button
              type="button"
              size="sm"
              onClick={() => setShowFaq(false)}
            >
              Quay lại hướng dẫn
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isFirstStep}
                onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
              >
                <ChevronLeft aria-hidden="true" />
                Trước
              </Button>
              {isLastStep ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setOpen(false)}
                >
                  Hoàn tất
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    setStepIndex((prev) => Math.min(totalSteps - 1, prev + 1))
                  }
                >
                  Tiếp theo
                  <ChevronRight aria-hidden="true" />
                </Button>
              )}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
