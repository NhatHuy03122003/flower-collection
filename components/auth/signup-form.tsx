"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signupAction } from "@/app/actions/auth";
import { LoadingButton } from "@/components/shared/loading-button";
import { Input } from "@/components/ui/input";
import type { AuthActionState } from "@/lib/user";

const INITIAL_STATE: AuthActionState = { status: "idle" };

export function SignupForm() {
  const [state, formAction, pending] = useActionState(
    signupAction,
    INITIAL_STATE,
  );

  return (
    <form action={formAction}>
      <fieldset disabled={pending} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="displayName"
            className="text-xs font-medium text-slate-700"
          >
            Họ tên <span className="text-rose-600">*</span>
          </label>
          <Input
            id="displayName"
            name="displayName"
            autoComplete="name"
            aria-invalid={state.errors?.displayName ? true : undefined}
          />
          {state.errors?.displayName ? (
            <p className="text-xs text-rose-700">{state.errors.displayName}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="username"
            className="text-xs font-medium text-slate-700"
          >
            Tên đăng nhập <span className="text-rose-600">*</span>
          </label>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            aria-invalid={state.errors?.username ? true : undefined}
          />
          {state.errors?.username ? (
            <p className="text-xs text-rose-700">{state.errors.username}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-xs font-medium text-slate-700"
          >
            Mật khẩu <span className="text-rose-600">*</span>
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={state.errors?.password ? true : undefined}
          />
          {state.errors?.password ? (
            <p className="text-xs text-rose-700">{state.errors.password}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="text-xs font-medium text-slate-700"
          >
            Xác nhận mật khẩu <span className="text-rose-600">*</span>
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={state.errors?.confirmPassword ? true : undefined}
          />
          {state.errors?.confirmPassword ? (
            <p className="text-xs text-rose-700">
              {state.errors.confirmPassword}
            </p>
          ) : null}
        </div>

        {state.errors?.form ? (
          <p className="text-xs text-rose-700">{state.errors.form}</p>
        ) : null}

        <LoadingButton className="w-full" pendingLabel="Đang tạo tài khoản...">
          Đăng ký
        </LoadingButton>

        <p className="text-center text-xs text-rose-900/70">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="font-semibold text-rose-700 hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </fieldset>
    </form>
  );
}
