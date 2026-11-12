"use client";

import Link from "next/link";
import { LogIn, LogOut, UserPlus } from "lucide-react";

import { logoutAction } from "@/app/actions/auth";
import { LoadingButton } from "@/components/shared/loading-button";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/user";

export function UserMenu({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="hidden max-w-40 truncate text-xs font-medium text-rose-900 sm:inline">
        Xin chào,{" "}
        <span className="font-semibold text-rose-950">{user.displayName}</span>
      </span>
      <form action={logoutAction}>
        <LoadingButton
          variant="outline"
          size="sm"
          pendingLabel="Đang đăng xuất..."
        >
          <LogOut aria-hidden="true" />
          Đăng xuất
        </LoadingButton>
      </form>
    </div>
  );
}

export function AuthLinks() {
  return (
    <div className="flex items-center gap-1.5">
      <Button
        render={<Link href="/login" />}
        nativeButton={false}
        variant="outline"
        size="sm"
      >
        <LogIn aria-hidden="true" />
        Đăng nhập
      </Button>
      <Button
        render={<Link href="/signup" />}
        nativeButton={false}
        size="sm"
      >
        <UserPlus aria-hidden="true" />
        Đăng ký
      </Button>
    </div>
  );
}
