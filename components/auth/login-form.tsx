"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction } from "@/app/actions/auth";
import { LoadingButton } from "@/components/shared/loading-button";
import { Input } from "@/components/ui/input";
import type { AuthActionState } from "@/lib/user";

const INITIAL_STATE: AuthActionState = { status: "idle" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    INITIAL_STATE,
  );

  return (
    <form action={formAction}>
      <fieldset disabled={pending} className="space-y-4">
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
            autoComplete="current-password"
            aria-invalid={state.errors?.password ? true : undefined}
          />
          {state.errors?.password ? (
            <p className="text-xs text-rose-700">{state.errors.password}</p>
          ) : null}
        </div>

        {state.errors?.form ? (
          <p className="text-xs text-rose-700">{state.errors.form}</p>
        ) : null}

        <LoadingButton className="w-full" pendingLabel="Đang đăng nhập...">
          Đăng nhập
        </LoadingButton>

        <p className="text-center text-xs text-rose-900/70">
          Chưa có tài khoản?{" "}
          <Link
            href="/signup"
            className="font-semibold text-rose-700 hover:underline"
          >
            Đăng ký
          </Link>
        </p>
      </fieldset>
    </form>
  );
}
