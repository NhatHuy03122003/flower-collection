"use server";

import { revalidatePath } from "next/cache";

import {
  createMember,
  deactivateMember,
  getMemberById,
  isDisplayNameTaken,
  updateMember,
  validateMemberInput,
} from "@/lib/member";
import type { MemberActionState } from "@/lib/member";

export async function createMemberAction(
  _prevState: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const { data, errors } = validateMemberInput(formData);

  if (!data) {
    return { status: "error", errors };
  }

  if (await isDisplayNameTaken(data.displayName)) {
    return {
      status: "error",
      errors: { displayName: "Tên hiển thị này đã tồn tại." },
    };
  }

  await createMember(data);
  revalidatePath("/members");

  return { status: "success" };
}

export async function deactivateMemberAction(
  _prevState: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const id = formData.get("id");

  if (typeof id !== "string" || !id.trim()) {
    return {
      status: "error",
      errors: { form: "Không xác định được thành viên cần xóa." },
    };
  }

  const member = await getMemberById(id);

  if (!member) {
    return {
      status: "error",
      errors: { form: "Không tìm thấy thành viên." },
    };
  }

  await deactivateMember(id);
  revalidatePath("/members");

  return { status: "success" };
}

export async function updateMemberAction(
  _prevState: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const id = formData.get("id");

  if (typeof id !== "string" || !id.trim()) {
    return {
      status: "error",
      errors: { form: "Không xác định được thành viên cần sửa." },
    };
  }

  const { data, errors } = validateMemberInput(formData);

  if (!data) {
    return { status: "error", errors };
  }

  const member = await getMemberById(id);

  if (!member) {
    return {
      status: "error",
      errors: { form: "Không tìm thấy thành viên." },
    };
  }

  // Bỏ qua chính thành viên đang sửa để cho phép giữ nguyên tên hiện tại.
  if (await isDisplayNameTaken(data.displayName, id)) {
    return {
      status: "error",
      errors: { displayName: "Tên hiển thị này đã tồn tại." },
    };
  }

  await updateMember(id, data);
  revalidatePath("/members");
  revalidatePath("/");
  revalidatePath("/my-flowers");

  return { status: "success" };
}
