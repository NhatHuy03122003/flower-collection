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
 * excludeId: bỏ qua chính hoa đang sửa để cho phép giữ nguyên tên hiện tại.
 */
export async function isFlowerNameTaken(name: string, excludeId?: string) {
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
      ...(excludeId ? { id: { not: excludeId } } : {}),
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
 * Cập nhật thông tin hoa. Chỉ đụng tới các field cho phép sửa.
 * Không thay đổi id, isActive, owners, createdAt.
 */
export async function updateFlower(id: string, data: FlowerInput) {
  return prisma.flower.update({
    where: { id },
    data: {
      name: data.name,
      imageUrl: data.imageUrl,
      color: data.color,
      description: data.description,
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

/**
 * Lấy các hoa đã ẩn (isActive = false) để phục vụ khôi phục.
 */
export async function getArchivedFlowers() {
  return prisma.flower.findMany({
    where: { isActive: false },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

/**
 * Khôi phục hoa đã ẩn: chỉ set isActive = true.
 * Không tạo bản ghi mới, không đụng tới FlowerOwner hay createdAt.
 */
export async function restoreFlower(id: string) {
  return prisma.flower.update({
    where: { id },
    data: { isActive: true },
  });
}

// Google Drive không phục vụ ảnh trực tiếp cho <img> qua link share, và link
// dạng lh3.googleusercontent.com/d/<id> bị Google giới hạn tần suất nên ảnh
// hay vỡ. Chuẩn hoá mọi link Drive về endpoint thumbnail chính thức.
const GOOGLE_DRIVE_FILE_ID_PATTERNS: RegExp[] = [
  /drive\.google\.com\/file\/d\/([^/?#]+)/,
  /drive\.google\.com\/open\?[^#]*\bid=([^&?#]+)/,
  /drive\.google\.com\/uc\?[^#]*\bid=([^&?#]+)/,
  /drive\.google\.com\/thumbnail\?[^#]*\bid=([^&?#]+)/,
  /googleusercontent\.com\/d\/([^/?#=]+)/,
];

/**
 * Trả về URL ảnh hiển thị được trong <img>.
 * Link Google Drive (file/d, open?id, uc?id, thumbnail, lh3 /d/) được chuyển
 * về direct image URL. URL khác giữ nguyên. Không đổi cột imageUrl trong DB.
 */
export function getDisplayImageUrl(imageUrl: string): string {
  const url = imageUrl.trim();

  for (const pattern of GOOGLE_DRIVE_FILE_ID_PATTERNS) {
    const match = url.match(pattern);

    if (match?.[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w2000`;
    }
  }

  return url;
}
