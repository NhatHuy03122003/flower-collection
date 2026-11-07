"use server";

import { revalidatePath } from "next/cache";

import {
  clearCurrentMemberId,
  getCurrentMember,
  setCurrentMemberId,
} from "@/lib/current-member";
import { getFlowerById } from "@/lib/flower";
import { setFlowerOwner, toggleFlowerOwner } from "@/lib/flower-owner";
import { getMemberById } from "@/lib/member";

function revalidateCollections() {
  revalidatePath("/");
  revalidatePath("/flowers");
  revalidatePath("/my-flowers");
  // Danh sách thành viên và trang chi tiết đều phụ thuộc dữ liệu sở hữu.
  revalidatePath("/members", "layout");
}

/**
 * Đặt thành viên hiện tại cho phiên làm việc.
 * memberId ở đây là lựa chọn của người dùng; server xác thực lại trước khi ghi cookie.
 */
export async function setCurrentMemberAction(memberId: string) {
  if (typeof memberId !== "string" || !memberId.trim()) {
    await clearCurrentMemberId();
    revalidateCollections();
    return;
  }

  const member = await getMemberById(memberId);

  if (!member || !member.isActive) {
    await clearCurrentMemberId();
    revalidateCollections();
    return;
  }

  await setCurrentMemberId(member.id);
  revalidateCollections();
}

/**
 * Tick / bỏ tick một hoa cho thành viên hiện tại.
 * Client chỉ gửi flowerId; memberId do server đọc từ cookie nên không thể giả mạo.
 */
export async function toggleFlowerOwnerAction(flowerId: string) {
  if (typeof flowerId !== "string" || !flowerId.trim()) {
    return;
  }

  const member = await getCurrentMember();

  if (!member) {
    return;
  }

  const flower = await getFlowerById(flowerId);

  if (!flower) {
    return;
  }

  await toggleFlowerOwner(member.id, flower.id);
  revalidateCollections();
}

/**
 * Gán / bỏ chủ sở hữu cho một hoa từ trang quản lý hoa.
 * memberId rỗng => bỏ chủ. Server xác thực lại hoa và thành viên trước khi ghi.
 */
export async function assignFlowerOwnerAction(
  flowerId: string,
  memberId: string,
) {
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

  if (!member || !member.isActive) {
    return;
  }

  await setFlowerOwner(flower.id, member.id);
  revalidateCollections();
}
