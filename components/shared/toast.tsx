"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

const MESSAGES: Record<string, string> = {
  "login-success": "Đăng nhập thành công. Chào mừng trở lại!",
  "signup-success": "Đăng ký thành công. Hãy đăng nhập để tiếp tục.",
};

/**
 * Toast đơn giản, kích hoạt qua query `?toast=<key>` sau khi redirect.
 * Đọc một lần rồi xoá query để không hiện lại khi refresh.
 */
export function Toast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const key = searchParams.get("toast");
    const text = key ? MESSAGES[key] : undefined;

    if (!text) {
      return;
    }

    setMessage(text);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("toast");
    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [searchParams, pathname, router]);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = setTimeout(() => setMessage(null), 3200);

    return () => clearTimeout(timer);
  }, [message]);

  if (!message) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div
        role="status"
        className="pointer-events-auto flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 shadow-sm"
      >
        <CheckCircle2 aria-hidden="true" className="size-4" />
        {message}
      </div>
    </div>
  );
}
