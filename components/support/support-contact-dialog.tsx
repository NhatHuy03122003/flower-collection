"use client";

import Image from "next/image";
import { LifeBuoy, Mail, QrCode } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SUPPORT_EMAIL, SUPPORT_ZALO_QR } from "@/lib/support-contact";

const email = SUPPORT_EMAIL.trim();
const zaloQr = SUPPORT_ZALO_QR.trim();

export function SupportContactDialog({
  triggerClassName,
}: {
  triggerClassName: string;
}) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <button type="button" className={triggerClassName}>
            <LifeBuoy aria-hidden="true" className="size-3.5" />
            Liên hệ hỗ trợ
          </button>
        }
      />

      <DialogContent className="w-[calc(100%-1rem)] gap-0 overflow-hidden rounded-2xl border border-rose-200/80 bg-white p-0 sm:max-w-md">
        <DialogHeader className="border-b border-rose-100 bg-[#fff8fa] px-5 py-4 pr-12">
          <DialogTitle className="text-base font-bold text-rose-950">
            Liên hệ hỗ trợ
          </DialogTitle>
          <DialogDescription className="text-xs text-rose-900/70">
            Nếu gặp sự cố khi sử dụng ROSE Flower Collection, vui lòng liên hệ
            người phát triển để được hỗ trợ.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70dvh] space-y-4 overflow-y-auto px-5 py-4">
          <section className="space-y-3 rounded-xl border border-rose-200/80 bg-rose-50/40 p-3.5">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-rose-950">
              <QrCode aria-hidden="true" className="size-4 text-rose-600" />
              Zalo
            </h3>

            {zaloQr ? (
              <div className="flex flex-col items-center gap-2">
                <Image
                  src={zaloQr}
                  alt="Mã QR Zalo hỗ trợ"
                  width={512}
                  height={512}
                  unoptimized
                  className="aspect-square w-full max-w-56 rounded-lg border border-rose-100 bg-white object-contain p-2"
                />
                <p className="text-center text-sm font-semibold text-rose-900">
                  Nguyen Nhat Huy
                </p>
              </div>
            ) : (
              <div className="mx-auto flex aspect-square w-full max-w-56 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-rose-200 bg-white px-3 text-center text-xs text-muted-foreground">
                <QrCode aria-hidden="true" className="size-6 text-rose-300" />
                Mã QR Zalo sẽ được cập nhật sớm.
              </div>
            )}
          </section>

          <section className="space-y-3 rounded-xl border border-rose-200/80 bg-rose-50/40 p-3.5">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-rose-950">
              <Mail aria-hidden="true" className="size-4 text-rose-600" />
              Email
            </h3>

            {email ? (
              <p className="break-all text-sm font-medium text-slate-800">
                {email}
              </p>
            ) : (
              <p className="rounded-lg border border-dashed border-rose-200 bg-white px-3 py-2.5 text-center text-xs text-muted-foreground">
                Email hỗ trợ chưa được cấu hình.
              </p>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
