"use server";

import { revalidatePath } from "next/cache";

import {
  AuthError,
  requireAdmin,
  requireAuth,
  requireMemberAccess,
} from "@/lib/auth-guard";
import {
  clearCurrentMemberId,
  getCurrentMember,
  setCurrentMemberId,
} from "@/lib/current-member";
import { getFlowerById } from "@/lib/flower";
import { setFlowerOwner, toggleFlowerOwner } from "@/lib/flower-owner";
import { getMemberById } from "@/lib/member";

export type FlowerOwnerActionResult =
  | { status: "success" }
  | {
      status: "error";
      code:
        | "UNAUTHENTICATED"
        | "FORBIDDEN"
        | "NO_MEMBER"
        | "INVALID_INPUT";
      message: string;
    };

function mapAuthError(error: unknown): FlowerOwnerActionResult {
  if (error instanceof AuthError) {
    return {
      status: "error",
      code: error.code,
      message: error.message,
    };
  }
  throw error;
}

function revalidateCollections() {
  revalidatePath("/");
  revalidatePath("/flowers");
  revalidatePath("/my-flowers");
  // Danh sách thành viên và trang chi tiết đều phụ thuộc dữ liệu sở hữu.
  revalidatePath("/members", "layout");
}

/**
 * Đặt thành viên hiện tại cho phiên làm việc.
 * memberId ở đây là lựa chọn của người dùng; server xác thực lại quyền trước khi ghi cookie.
 */
export async function setCurrentMemberAction(
  memberId: string,
): Promise<FlowerOwnerActionResult> {
  try {
    await requireAuth();
  } catch (error) {
    return mapAuthError(error);
  }

  if (typeof memberId !== "string") {
    return {
      status: "error",
      code: "INVALID_INPUT",
      message: "Mã thành viên không hợp lệ.",
    };
  }

  const normalizedMemberId = memberId.trim();

  if (!normalizedMemberId) {
    await clearCurrentMemberId();
    revalidateCollections();
    return { status: "success" };
  }

  let member;
  try {
    ({ member } = await requireMemberAccess(normalizedMemberId));
  } catch (error) {
    return mapAuthError(error);
  }

  await setCurrentMemberId(member.id);
  revalidateCollections();
  return { status: "success" };
}

/**
 * Tick / bỏ tick một hoa cho thành viên hiện tại.
 * Client chỉ gửi flowerId; memberId do server đọc từ cookie và xác minh quyền truy cập.
 */
export async function toggleFlowerOwnerAction(
  flowerId: string,
): Promise<FlowerOwnerActionResult> {
  try {
    await requireAuth();
  } catch (error) {
    return mapAuthError(error);
  }

  if (typeof flowerId !== "string" || !flowerId.trim()) {
    return {
      status: "error",
      code: "INVALID_INPUT",
      message: "Không xác định được hoa cần thao tác.",
    };
  }

  const member = await getCurrentMember();

  if (!member) {
    await clearCurrentMemberId();
    revalidateCollections();
    return {
      status: "error",
      code: "NO_MEMBER",
      message: "Thành viên hiện tại không còn hợp lệ hoặc đã bị thu hồi quyền.",
    };
  }

  try {
    await requireMemberAccess(member.id);
  } catch (error) {
    if (error instanceof AuthError && error.code === "FORBIDDEN") {
      await clearCurrentMemberId();
      revalidateCollections();
    }
    return mapAuthError(error);
  }

  const flower = await getFlowerById(flowerId);

  if (!flower) {
    return {
      status: "error",
      code: "INVALID_INPUT",
      message: "Không tìm thấy hoa.",
    };
  }

  await toggleFlowerOwner(member.id, flower.id);
  revalidatePath("/");
  revalidatePath("/flowers");
  revalidatePath("/my-flowers");
  revalidatePath("/members");
  revalidatePath("/members/[id]", "page");
  return { status: "success" };
}

/**
 * Gán / bỏ chủ sở hữu cho một hoa từ trang quản lý hoa (ADMIN-only).
 * memberId rỗng => bỏ toàn bộ chủ. Server xác thực quyền ADMIN, hoa và thành viên trước khi ghi.
 */
export async function assignFlowerOwnerAction(
  flowerId: string,
  memberId: string,
) {
  await requireAdmin();

  if (typeof flowerId !== "string" || !flowerId.trim()) {
    return;
  }

  const flower = await getFlowerById(flowerId);

  if (!flower) {
    return;
  }

  const ownerId = typeof memberId === "string" ? memberId.trim() : "";

  if (!ownerId) {
    await setFlowerOwner(flower.id, null);
    revalidateCollections();
    return;
  }

  const member = await getMemberById(ownerId);

  if (!member) {
    return;
  }

  await setFlowerOwner(flower.id, member.id);
  revalidateCollections();
}
