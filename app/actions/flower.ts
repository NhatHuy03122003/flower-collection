"use server";

import { revalidatePath } from "next/cache";

import { AuthError, requireAdmin } from "@/lib/auth-guard";
import {
  createFlower,
  createFlowers,
  deactivateFlower,
  getActiveFlowerNames,
  getFlowerById,
  isFlowerNameTaken,
  restoreFlower,
  updateFlower,
  validateFlowerInput,
} from "@/lib/flower";
import type { FlowerActionState } from "@/lib/flower";
import {
  IMPORT_MAX_BYTES,
  analyzeFlowerImportRows,
  parseFlowerImportContent,
} from "@/lib/flower-import";
import type { FlowerImportFormat } from "@/lib/flower-import";
import { createNotificationSafely } from "@/lib/notification";

function revalidateFlowerPaths() {
  revalidatePath("/flowers");
  revalidatePath("/");
  revalidatePath("/my-flowers");
  // Tiến độ sở hữu ở trang thành viên phụ thuộc số hoa đang hoạt động.
  revalidatePath("/members", "layout");
}

async function authorizeAdminForForm(): Promise<FlowerActionState | null> {
  try {
    await requireAdmin();
    return null;
  } catch (error) {
    if (error instanceof AuthError) {
      return { status: "error", errors: { form: error.message } };
    }
    throw error;
  }
}

export async function createFlowerAction(
  _prevState: FlowerActionState,
  formData: FormData,
): Promise<FlowerActionState> {
  const authError = await authorizeAdminForForm();
  if (authError) {
    return authError;
  }

  const { data, errors } = validateFlowerInput(formData);

  if (!data) {
    return { status: "error", errors };
  }

  if (await isFlowerNameTaken(data.name)) {
    return {
      status: "error",
      errors: { name: "Tên hoa này đã tồn tại." },
    };
  }

  await createFlower(data);
  revalidateFlowerPaths();

  return { status: "success" };
}

export async function deactivateFlowerAction(
  _prevState: FlowerActionState,
  formData: FormData,
): Promise<FlowerActionState> {
  const authError = await authorizeAdminForForm();
  if (authError) {
    return authError;
  }

  const id = formData.get("id");

  if (typeof id !== "string" || !id.trim()) {
    return {
      status: "error",
      errors: { form: "Không xác định được hoa cần xóa." },
    };
  }

  const flower = await getFlowerById(id);

  if (!flower) {
    return {
      status: "error",
      errors: { form: "Không tìm thấy hoa." },
    };
  }

  await deactivateFlower(id);
  revalidateFlowerPaths();

  return { status: "success" };
}

export async function restoreFlowerAction(
  _prevState: FlowerActionState,
  formData: FormData,
): Promise<FlowerActionState> {
  const authError = await authorizeAdminForForm();
  if (authError) {
    return authError;
  }

  const id = formData.get("id");

  if (typeof id !== "string" || !id.trim()) {
    return {
      status: "error",
      errors: { form: "Không xác định được hoa cần khôi phục." },
    };
  }

  const flower = await getFlowerById(id);

  if (!flower) {
    return {
      status: "error",
      errors: { form: "Không tìm thấy hoa." },
    };
  }

  await restoreFlower(id);
  revalidateFlowerPaths();

  return { status: "success" };
}

export async function updateFlowerAction(
  _prevState: FlowerActionState,
  formData: FormData,
): Promise<FlowerActionState> {
  const authError = await authorizeAdminForForm();
  if (authError) {
    return authError;
  }

  const id = formData.get("id");

  if (typeof id !== "string" || !id.trim()) {
    return {
      status: "error",
      errors: { form: "Không xác định được hoa cần sửa." },
    };
  }

  const { data, errors } = validateFlowerInput(formData);

  if (!data) {
    return { status: "error", errors };
  }

  const flower = await getFlowerById(id);

  if (!flower) {
    return {
      status: "error",
      errors: { form: "Không tìm thấy hoa." },
    };
  }

  // Bỏ qua chính hoa đang sửa để cho phép giữ nguyên tên hiện tại.
  if (await isFlowerNameTaken(data.name, id)) {
    return {
      status: "error",
      errors: { name: "Tên hoa này đã tồn tại." },
    };
  }

  await updateFlower(id, data);
  revalidateFlowerPaths();

  return { status: "success" };
}

export type ImportFlowersResult =
  | { status: "success"; imported: number; skipped: number }
  | { status: "error"; message: string };

/**
 * Import hàng loạt hoa từ nội dung file (đã đọc ở client).
 * Server parse + validate + dedup lại từ đầu để không tin dữ liệu client.
 */
export async function importFlowersAction(
  content: string,
  format: FlowerImportFormat,
): Promise<ImportFlowersResult> {
  let adminUserId: string;
  try {
    const admin = await requireAdmin();
    adminUserId = admin.id;
  } catch (error) {
    if (error instanceof AuthError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }

  if (typeof content !== "string" || !content.trim()) {
    return { status: "error", message: "Nội dung file trống." };
  }

  if (format !== "csv" && format !== "json") {
    return { status: "error", message: "Định dạng file không được hỗ trợ." };
  }

  if (Buffer.byteLength(content, "utf8") > IMPORT_MAX_BYTES) {
    return { status: "error", message: "File vượt quá 1MB." };
  }

  const parsed = parseFlowerImportContent(content, format);

  if (parsed.error) {
    return { status: "error", message: parsed.error };
  }

  const existingNames = await getActiveFlowerNames();
  const preview = analyzeFlowerImportRows(parsed.rows || [], existingNames);

  if (preview.importable.length === 0) {
    return { status: "error", message: "Không có hoa hợp lệ để import." };
  }

  await createFlowers(preview.importable);
  revalidateFlowerPaths();

  const imported = preview.importable.length;
  const skipped = preview.totalRows - imported;

  await createNotificationSafely({
    userId: adminUserId,
    type: skipped > 0 ? "FLOWER_IMPORT_PARTIAL" : "FLOWER_IMPORT_COMPLETED",
    title:
      skipped > 0
        ? "Import dữ liệu hoa hoàn tất một phần"
        : "Import dữ liệu hoa hoàn tất",
    message:
      skipped > 0
        ? `Import thành công ${imported} hoa, bỏ qua/lỗi ${skipped} dòng.`
        : `Import thành công toàn bộ ${imported} hoa vào danh mục.`,
  });

  return {
    status: "success",
    imported,
    skipped,
  };
}
