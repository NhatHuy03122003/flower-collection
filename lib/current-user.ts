import { cookies } from "next/headers";

import {
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  createSessionToken,
  verifySessionToken,
} from "./session";
import { getUserById } from "./user";

/**
 * Trả về người dùng đang đăng nhập dựa trên cookie session đã ký.
 * Trả về null nếu chưa đăng nhập, cookie sai chữ ký hoặc user không tồn tại.
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!userId) {
    return null;
  }

  return getUserById(userId);
}

/**
 * Ghi cookie session cho user. Chỉ gọi trong Server Action hoặc Route Handler.
 */
export async function setUserSession(userId: string) {
  const cookieStore = await cookies();

  cookieStore.set(
    SESSION_COOKIE,
    createSessionToken(userId),
    SESSION_COOKIE_OPTIONS,
  );
}

/**
 * Xoá cookie session (đăng xuất). Chỉ gọi trong Server Action / Route Handler.
 */
export async function clearUserSession() {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, "", {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: 0,
  });
}
