import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Đăng ký — Hội ROSE Flower Collection",
};

export default function SignupPage() {
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
            Tạo tài khoản mới
          </p>
        </div>

        <SignupForm />
      </div>
    </div>
  );
}
