import { BookOpen } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { GuideModal } from "@/components/guide/guide-modal";

export const metadata = {
  title: "Đăng nhập — Hội ROSE Flower Collection",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6d8e1] px-4 py-10 font-sans text-slate-800">
      <div className="w-full max-w-sm rounded-2xl border border-rose-200/80 bg-white p-6 shadow-sm">
        <div className="mb-5 text-center">
          <span aria-hidden="true" className="text-2xl">
            🌹
          </span>
          <h1 className="mt-1 text-lg font-bold tracking-tight text-rose-950">
            Hội ROSE Flower Collection
          </h1>
          <p className="mt-0.5 text-xs text-rose-900/60">
            Đăng nhập để tiếp tục
          </p>
        </div>

        <LoginForm />
      </div>

      <section
        aria-labelledby="login-guide-heading"
        className="mt-4 w-full max-w-sm rounded-2xl border border-rose-200/80 bg-[#fff8fa] p-4 shadow-sm"
      >
        <div className="flex items-start gap-2.5">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
            <BookOpen aria-hidden="true" className="size-4" />
          </span>
          <div className="space-y-1.5">
            <h2
              id="login-guide-heading"
              className="text-xs font-semibold text-rose-950"
            >
              Bạn chưa biết cách sử dụng ROSE?
            </h2>
            <p className="text-xs leading-relaxed text-rose-900/70">
              Xem hướng dẫn từng bước để biết cách chọn thành viên, tìm hoa và
              đánh dấu những bông hoa bạn yêu thích.
            </p>
            <GuideModal />
          </div>
        </div>
      </section>
    </div>
  );
}
