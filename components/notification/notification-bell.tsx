"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Bell, Check, CheckCheck } from "lucide-react";

import {
  fetchMyNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/actions/notification";
import { Button } from "@/components/ui/button";
import type { NotificationItem } from "@/lib/notification";

const POLL_INTERVAL_MS = 20_000;

function mergeUniqueNotifications(items: NotificationItem[]): NotificationItem[] {
  const seen = new Set<string>();
  const unique: NotificationItem[] = [];

  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      unique.push(item);
    }
  }

  unique.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return unique;
}

function formatNotificationTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationBell({
  initialNotifications,
  initialUnreadCount,
}: {
  initialNotifications: NotificationItem[];
  initialUnreadCount: number;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isPollingRef = useRef(false);
  const stoppedRef = useRef(false);

  useEffect(() => {
    setNotifications(mergeUniqueNotifications(initialNotifications));
    setUnreadCount(initialUnreadCount);
  }, [initialNotifications, initialUnreadCount]);

  useEffect(() => {
    let isMounted = true;

    async function pollNotifications() {
      if (
        !isMounted ||
        stoppedRef.current ||
        isPollingRef.current ||
        document.visibilityState === "hidden"
      ) {
        return;
      }

      isPollingRef.current = true;
      try {
        const result = await fetchMyNotificationsAction();
        if (!isMounted) {
          return;
        }

        if (result.status === "unauthenticated") {
          stoppedRef.current = true;
          return;
        }

        setNotifications(mergeUniqueNotifications(result.feed.notifications));
        setUnreadCount(result.feed.unreadCount);
      } catch {
        // Bỏ qua lỗi mạng tạm thời để không làm gián đoạn giao diện; thử lại ở chu kỳ sau.
      } finally {
        isPollingRef.current = false;
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void pollNotifications();
      }
    }

    const intervalId = setInterval(() => {
      void pollNotifications();
    }, POLL_INTERVAL_MS);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function handleMarkAsRead(notificationId: string) {
    setErrorMessage(null);
    setPendingId(notificationId);

    startTransition(async () => {
      const result = await markNotificationReadAction(notificationId);
      setPendingId(null);

      if (result.status === "error") {
        setErrorMessage(result.message);
        return;
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, isRead: true } : item,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      router.refresh();
    });
  }

  function handleMarkAllAsRead() {
    if (unreadCount === 0) {
      return;
    }

    setErrorMessage(null);
    setPendingId("all");

    startTransition(async () => {
      const result = await markAllNotificationsReadAction();
      setPendingId(null);

      if (result.status === "error") {
        setErrorMessage(result.message);
        return;
      }

      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true })),
      );
      setUnreadCount(0);
      router.refresh();
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={
          unreadCount > 0
            ? `Thông báo (${unreadCount} chưa đọc)`
            : "Thông báo"
        }
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((prev) => !prev)}
        className="relative size-8 rounded-full border-rose-200 bg-white p-0 text-rose-900 hover:bg-rose-50"
      >
        <Bell aria-hidden="true" className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 inline-flex min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] leading-4 font-bold text-white tabular-nums">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div
          role="dialog"
          aria-label="Danh sách thông báo"
          className="fixed inset-x-3 top-15 z-50 rounded-2xl border border-rose-200 bg-white shadow-lg sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-96"
        >
          <div className="flex items-center justify-between gap-2 border-b border-rose-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-rose-950">Thông báo</h2>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-900 tabular-nums">
                  {unreadCount} chưa đọc
                </span>
              ) : null}
            </div>

            <button
              type="button"
              disabled={unreadCount === 0 || isPending}
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <CheckCheck aria-hidden="true" className="size-3.5" />
              {pendingId === "all" ? "Đang xử lý..." : "Đọc tất cả"}
            </button>
          </div>

          {errorMessage ? (
            <p className="border-b border-rose-100 bg-rose-50 px-4 py-2 text-xs font-medium text-rose-700">
              {errorMessage}
            </p>
          ) : null}

          <div className="max-h-96 overflow-y-auto divide-y divide-rose-100">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-slate-500">
                Chưa có thông báo nào.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={
                    item.isRead
                      ? "bg-white px-4 py-3"
                      : "bg-rose-50/70 px-4 py-3"
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-2">
                      <span
                        aria-hidden="true"
                        className={
                          item.isRead
                            ? "mt-1.5 size-2 shrink-0 rounded-full bg-transparent"
                            : "mt-1.5 size-2 shrink-0 rounded-full bg-rose-600"
                        }
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-xs font-semibold text-rose-950">
                            {item.title}
                          </p>
                          {item.type === "USER_PENDING_MEMBER_ASSIGNMENT" ? (
                            <span
                              className={
                                item.resolvedAt
                                  ? "rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700"
                                  : "rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800"
                              }
                            >
                              {item.resolvedAt ? "Đã xử lý" : "Chờ xử lý"}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs leading-relaxed text-slate-600">
                          {item.message}
                        </p>
                        {item.linkUrl ? (
                          <Link
                            href={item.linkUrl}
                            onClick={() => setOpen(false)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 hover:text-rose-900 hover:underline"
                          >
                            Mở trang quản lý tài khoản
                            <ArrowUpRight
                              aria-hidden="true"
                              className="size-3"
                            />
                          </Link>
                        ) : null}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          <time
                            dateTime={item.createdAt}
                            suppressHydrationWarning
                          >
                            {formatNotificationTime(item.createdAt)}
                          </time>
                          <span>•</span>
                          <span>{item.isRead ? "Đã đọc" : "Chưa đọc"}</span>
                        </div>
                      </div>
                    </div>

                    {!item.isRead ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleMarkAsRead(item.id)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-rose-200 bg-white px-2 py-1 text-[11px] font-semibold text-rose-800 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Check aria-hidden="true" className="size-3" />
                        {pendingId === item.id ? "Đang lưu..." : "Đã đọc"}
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
