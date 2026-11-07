import { prisma } from "./prisma";

// Member là dữ liệu nội bộ:
// - Soft delete bằng isActive = false (không bao giờ xoá cứng)
// - Thành viên đã ẩn không hiển thị ở danh sách
export async function getMembers() {
  return prisma.member.findMany({
    where: { isActive: true },
    orderBy: {
      displayName: "asc",
    },
  });
}

export type Member = Awaited<ReturnType<typeof getMembers>>[number];

export type MemberInput = {
  displayName: string;
  gameHandle: string | null;
  avatarUrl: string | null;
};

export type MemberFieldErrors = Partial<
  Record<"displayName" | "gameHandle" | "avatarUrl" | "form", string>
>;

export type MemberActionState = {
  status: "idle" | "success" | "error";
  errors?: MemberFieldErrors;
};

const DISPLAY_NAME_MAX_LENGTH = 80;
const GAME_HANDLE_MAX_LENGTH = 50;
const AVATAR_URL_MAX_LENGTH = 500;

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
export function validateMemberInput(
  formData: FormData,
):
  | { data: MemberInput; errors: null }
  | { data: null; errors: MemberFieldErrors } {
  const rawDisplayName = formData.get("displayName");
  const rawGameHandle = formData.get("gameHandle");
  const rawAvatarUrl = formData.get("avatarUrl");

  const displayName =
    typeof rawDisplayName === "string" ? rawDisplayName.trim() : "";
  const gameHandle =
    typeof rawGameHandle === "string" ? rawGameHandle.trim() : "";
  const avatarUrl = typeof rawAvatarUrl === "string" ? rawAvatarUrl.trim() : "";

  const errors: MemberFieldErrors = {};

  if (!displayName) {
    errors.displayName = "Vui lòng nhập tên hiển thị.";
  } else if (displayName.length > DISPLAY_NAME_MAX_LENGTH) {
    errors.displayName = `Tên hiển thị tối đa ${DISPLAY_NAME_MAX_LENGTH} ký tự.`;
  }

  if (gameHandle.length > GAME_HANDLE_MAX_LENGTH) {
    errors.gameHandle = `Tên trong game tối đa ${GAME_HANDLE_MAX_LENGTH} ký tự.`;
  }

  if (avatarUrl) {
    if (avatarUrl.length > AVATAR_URL_MAX_LENGTH) {
      errors.avatarUrl = `Đường dẫn ảnh tối đa ${AVATAR_URL_MAX_LENGTH} ký tự.`;
    } else if (!isHttpUrl(avatarUrl)) {
      errors.avatarUrl =
        "Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { data: null, errors };
  }

  return {
    data: {
      displayName,
      gameHandle: gameHandle || null,
      avatarUrl: avatarUrl || null,
    },
    errors: null,
  };
}

/**
 * Kiểm tra trùng tên hiển thị theo trim + lowercase.
 * Chỉ so với các thành viên đang hiển thị (isActive = true).
 */
export async function isDisplayNameTaken(displayName: string) {
  const normalized = displayName.trim();

  if (!normalized) {
    return false;
  }

  const existing = await prisma.member.findFirst({
    where: {
      isActive: true,
      displayName: {
        equals: normalized,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  return existing !== null;
}

export async function getMemberById(id: string) {
  return prisma.member.findUnique({
    where: { id },
  });
}

export async function createMember(data: MemberInput) {
  return prisma.member.create({
    data,
  });
}

/**
 * Soft delete: chỉ ẩn thành viên, không xoá khỏi database.
 */
export async function deactivateMember(id: string) {
  return prisma.member.update({
    where: { id },
    data: { isActive: false },
  });
}
