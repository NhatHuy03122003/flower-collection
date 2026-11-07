"use server";

import { revalidatePath } from "next/cache";

import {
  createMember,
  deactivateMember,
  getMemberById,
  isDisplayNameTaken,
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
