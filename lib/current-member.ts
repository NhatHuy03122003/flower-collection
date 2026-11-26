import { cache } from "react";
import { cookies } from "next/headers";

import { getCurrentUser } from "./current-user";
import { getMemberById } from "./member";
import type { Member } from "./member";
import { prisma } from "./prisma";

// Cookie chỉ lưu lựa chọn Member hiện tại ở UI, KHÔNG phải bằng chứng phân quyền.
// Cookie là httpOnly => trình duyệt không đọc/ghi được, chỉ server xác thực và quyết định.
export const CURRENT_MEMBER_COOKIE = "rose_current_member_id";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: process.env.NODE_ENV === "production",
} as const;

// Chỉ đọc cookie thô, không kiểm tra quyền hay sự tồn tại của thành viên.
async function readCurrentMemberId(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(CURRENT_MEMBER_COOKIE)?.value;

  return value && value.trim() ? value : null;
}

/**
 * Trả về thành viên hiện tại nếu người dùng đã đăng nhập và có quyền truy cập Member đó.
 * - Guest: luôn trả về null.
 * - ADMIN: truy cập được bất kỳ Member nào tồn tại trong DB.
 * - USER: chỉ truy cập được Member đang active và được gán qua UserMember.
 * Lưu ý: KHÔNG gọi cookies().set()/delete() ở đây vì hàm được gọi từ Server Component.
 * Bọc cache() để header và nội dung trang không query trùng trong cùng request.
 */
export const getCurrentMember = cache(async (): Promise<Member | null> => {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const memberId = await readCurrentMemberId();

  if (!memberId) {
    return null;
  }

  const member = await getMemberById(memberId);

  if (!member) {
    return null;
  }

  if (user.role === "ADMIN") {
    return member;
  }

  if (!member.isActive) {
    return null;
  }

  const assignment = await prisma.userMember.findUnique({
    where: {
      userId_memberId: {
        userId: user.id,
        memberId: member.id,
      },
    },
    select: { id: true },
  });

  return assignment ? member : null;
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
