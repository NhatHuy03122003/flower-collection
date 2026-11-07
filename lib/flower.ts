import { prisma } from "./prisma";

// Flower là dữ liệu nội bộ:
// - Soft delete bằng isActive = false (không bao giờ xoá cứng)
// - Hoa đã ẩn không hiển thị ở danh sách
export async function getFlowers() {
  return prisma.flower.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export type Flower = Awaited<ReturnType<typeof getFlowers>>[number];

export type FlowerInput = {
  name: string;
  imageUrl: string;
  color: string | null;
  description: string | null;
};

export type FlowerFieldErrors = Partial<
  Record<"name" | "imageUrl" | "color" | "description" | "form", string>
>;

export type FlowerActionState = {
  status: "idle" | "success" | "error";
  errors?: FlowerFieldErrors;
};

const NAME_MAX_LENGTH = 100;
const IMAGE_URL_MAX_LENGTH = 500;
const COLOR_MAX_LENGTH = 50;
const DESCRIPTION_MAX_LENGTH = 1000;

/**
 * Kiểm tra http:// hoặc https:// là hợp lệ.
 */
function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Chuẩn hoá + validate dữ liệu thô từ FormData.
 * Trả về lỗi theo từng field để UI hiển thị.
 */
export function validateFlowerInput(
  formData: FormData,
):
  | { data: FlowerInput; errors: null }
  | { data: null; errors: FlowerFieldErrors } {
  const rawName = formData.get("name");
  const rawImageUrl = formData.get("imageUrl");
  const rawColor = formData.get("color");
  const rawDescription = formData.get("description");

  const name = typeof rawName === "string" ? rawName.trim() : "";
  const imageUrl = typeof rawImageUrl === "string" ? rawImageUrl.trim() : "";
  const color = typeof rawColor === "string" ? rawColor.trim() : "";
  const description =
    typeof rawDescription === "string" ? rawDescription.trim() : "";

  const errors: FlowerFieldErrors = {};

  if (!name) {
    errors.name = "Vui lòng nhập tên hoa.";
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.name = `Tên hoa tối đa ${NAME_MAX_LENGTH} ký tự.`;
  }

  if (!imageUrl) {
    errors.imageUrl = "Vui lòng nhập đường dẫn ảnh.";
  } else if (imageUrl.length > IMAGE_URL_MAX_LENGTH) {
    errors.imageUrl = `Đường dẫn ảnh tối đa ${IMAGE_URL_MAX_LENGTH} ký tự.`;
  } else if (!isHttpUrl(imageUrl)) {
    errors.imageUrl = "Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://";
  }

  if (color.length > COLOR_MAX_LENGTH) {
    errors.color = `Màu tối đa ${COLOR_MAX_LENGTH} ký tự.`;
  }

  if (description.length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `Mô tả tối đa ${DESCRIPTION_MAX_LENGTH} ký tự.`;
  }

  if (Object.keys(errors).length > 0) {
    return { data: null, errors };
  }

  return {
    data: {
      name,
      imageUrl,
      color: color || null,
      description: description || null,
    },
    errors: null,
  };
}

/**
 * Kiểm tra trùng tên hoa theo trim + lowercase.
 * Chỉ so với các hoa đang hiển thị (isActive = true).
 */
export async function isFlowerNameTaken(name: string) {
  const normalized = name.trim();

  if (!normalized) {
    return false;
  }

  const existing = await prisma.flower.findFirst({
    where: {
      isActive: true,
      name: {
        equals: normalized,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  return existing !== null;
}

export async function getFlowerById(id: string) {
  return prisma.flower.findUnique({
    where: { id },
  });
}

export async function createFlower(data: FlowerInput) {
  return prisma.flower.create({
    data: {
      name: data.name,
      imageUrl: data.imageUrl,
      color: data.color,
      description: data.description,
      // price là cột bắt buộc trong schema nhưng chưa dùng ở luồng quản lý hoa.
      price: 0,
    },
  });
}

/**
 * Lấy tên các hoa đang hoạt động để phục vụ chống trùng khi import.
 * Hoa đã ẩn (isActive = false) không tính là trùng.
 */
export async function getActiveFlowerNames() {
  const flowers = await prisma.flower.findMany({
    where: { isActive: true },
    select: { name: true },
  });

  return flowers.map((flower) => flower.name);
}

/**
 * Tạo hàng loạt hoa bằng createMany.
 * price = 0 để tương thích cột bắt buộc trong schema hiện tại.
 */
export async function createFlowers(data: FlowerInput[]) {
  if (data.length === 0) {
    return { count: 0 };
  }

  return prisma.flower.createMany({
    data: data.map((row) => ({
      name: row.name,
      imageUrl: row.imageUrl,
      color: row.color,
      description: row.description,
      price: 0,
    })),
  });
}

/**
 * Soft delete: chỉ ẩn hoa, không xoá khỏi database và không đụng tới FlowerOwner.
 */
export async function deactivateFlower(id: string) {
  return prisma.flower.update({
    where: { id },
    data: { isActive: false },
  });
}
