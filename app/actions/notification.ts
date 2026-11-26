"use server";

import { revalidatePath } from "next/cache";

import { AuthError } from "@/lib/auth-guard";
import { getCurrentUser } from "@/lib/current-user";
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationFeed,
} from "@/lib/notification";

export type NotificationActionResult =
  | { status: "success" }
  | { status: "error"; message: string };

export type FetchNotificationsResult =
  | { status: "ok"; feed: NotificationFeed }
  | { status: "unauthenticated" };

export async function fetchMyNotificationsAction(): Promise<FetchNotificationsResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { status: "unauthenticated" };
  }

  const feed = await getMyNotifications();
  return { status: "ok", feed };
}

export async function markNotificationReadAction(
  notificationId: string,
): Promise<NotificationActionResult> {
  try {
    const updated = await markNotificationAsRead(notificationId);

    if (!updated) {
      return {
        status: "error",
        message: "Không tìm thấy thông báo hoặc bạn không có quyền thao tác.",
      };
    }

    revalidatePath("/", "layout");
    return { status: "success" };
  } catch (error) {
    if (error instanceof AuthError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}

export async function markAllNotificationsReadAction(): Promise<NotificationActionResult> {
  try {
    await markAllNotificationsAsRead();
    revalidatePath("/", "layout");
    return { status: "success" };
  } catch (error) {
    if (error instanceof AuthError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}
