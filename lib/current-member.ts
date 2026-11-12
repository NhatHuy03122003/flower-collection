import { cache } from "react";
import { cookies } from "next/headers";

import { getMemberById } from "./member";
import type { Member } from "./member";

// Chưa có hệ thống đăng nhập nên "thành viên hiện tại" được lưu trong cookie.
// Cookie là httpOnly => trình duyệt không đọc/ghi được, chỉ server quyết định.
export const CURRENT_MEMBER_COOKIE = "rose_current_member_id";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
} as const;

// Chỉ đọc cookie thô, không kiểm tra thành viên còn tồn tại hay không.
async function readCurrentMemberId(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(CURRENT_MEMBER_COOKIE)?.value;

  return value && value.trim() ? value : null;
}

/**
 * Trả về thành viên hiện tại nếu cookie trỏ tới một thành viên còn hoạt động.
 * Cookie trỏ tới thành viên đã ẩn/không tồn tại được coi như chưa chọn.
 * Bọc cache() để header và nội dung trang không query trùng trong cùng request.
 */
export const getCurrentMember = cache(async (): Promise<Member | null> => {
  const memberId = await readCurrentMemberId();

  if (!memberId) {
    return null;
  }

  const member = await getMemberById(memberId);

  if (!member || !member.isActive) {
    return null;
  }

  return member;
});

/**
 * Ghi cookie thành viên hiện tại.
 * Chỉ gọi được trong Server Action hoặc Route Handler.
 */
export async function setCurrentMemberId(memberId: string) {
  const cookieStore = await cookies();
  cookieStore.set(CURRENT_MEMBER_COOKIE, memberId, COOKIE_OPTIONS);
}

/**
 * Xoá cookie thành viên hiện tại.
 * Chỉ gọi được trong Server Action hoặc Route Handler.
 */
export async function clearCurrentMemberId() {
  const cookieStore = await cookies();
  cookieStore.set(CURRENT_MEMBER_COOKIE, "", {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
}
