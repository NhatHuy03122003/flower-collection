import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import { prisma } from "./prisma";

const scryptAsync = promisify(scrypt);

const SCRYPT_KEYLEN = 64;
const PASSWORD_MIN_LENGTH = 6;
const USERNAME_MAX_LENGTH = 50;
const DISPLAY_NAME_MAX_LENGTH = 80;

export type User = {
  id: string;
  username: string;
  displayName: string;
  createdAt: Date;
};

export type SignupInput = {
  displayName: string;
  username: string;
  password: string;
};

export type LoginInput = {
  username: string;
  password: string;
};

export type AuthFieldErrors = Partial<
  Record<
    "displayName" | "username" | "password" | "confirmPassword" | "form",
    string
  >
>;

export type AuthActionState = {
  status: "idle" | "error";
  errors?: AuthFieldErrors;
};

export async function getUserByUsername(username: string) {
  return prisma.user.findFirst({
    where: {
      username: {
        equals: username.trim(),
        mode: "insensitive",
      },
    },
  });
}

export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, username: true, displayName: true, createdAt: true },
  });
}

export async function isUsernameTaken(username: string, excludeId?: string) {
  const normalized = username.trim();

  if (!normalized) {
    return false;
  }

  const existing = await prisma.user.findFirst({
    where: {
      username: {
        equals: normalized,
        mode: "insensitive",
      },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });

  return existing !== null;
}

export async function createUser(data: {
  username: string;
  displayName: string;
  passwordHash: string;
}) {
  return prisma.user.create({
    data: {
      username: data.username.trim(),
      displayName: data.displayName.trim(),
      passwordHash: data.passwordHash,
    },
    select: { id: true, username: true, displayName: true, createdAt: true },
  });
}

/**
 * Hash mật khẩu bằng scrypt (built-in của Node, không cần package ngoài).
 * Định dạng lưu: "scrypt$<salt hex>$<derived key hex>".
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, SCRYPT_KEYLEN)) as Buffer;

  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [scheme, salt, hash] = stored.split("$");

  if (scheme !== "scrypt" || !salt || !hash) {
    return false;
  }

  const derived = (await scryptAsync(password, salt, SCRYPT_KEYLEN)) as Buffer;
  const expected = Buffer.from(hash, "hex");

  if (expected.length !== derived.length) {
    return false;
  }

  return timingSafeEqual(derived, expected);
}

function readTextField(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function readPasswordField(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

/**
 * Validate dữ liệu đăng ký: không để trống, username hợp lệ,
 * mật khẩu tối thiểu 6 ký tự và mật khẩu xác nhận phải khớp.
 */
export function validateSignupInput(
  formData: FormData,
):
  | { data: SignupInput; errors: null }
  | { data: null; errors: AuthFieldErrors } {
  const displayName = readTextField(formData, "displayName");
  const username = readTextField(formData, "username");
  const password = readPasswordField(formData, "password");
  const confirmPassword = readPasswordField(formData, "confirmPassword");

  const errors: AuthFieldErrors = {};

  if (!displayName) {
    errors.displayName = "Vui lòng nhập họ tên.";
  } else if (displayName.length > DISPLAY_NAME_MAX_LENGTH) {
    errors.displayName = `Họ tên tối đa ${DISPLAY_NAME_MAX_LENGTH} ký tự.`;
  }

  if (!username) {
    errors.username = "Vui lòng nhập tên đăng nhập.";
  } else if (username.length > USERNAME_MAX_LENGTH) {
    errors.username = `Tên đăng nhập tối đa ${USERNAME_MAX_LENGTH} ký tự.`;
  }

  if (!password) {
    errors.password = "Vui lòng nhập mật khẩu.";
  } else if (password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Mật khẩu tối thiểu ${PASSWORD_MIN_LENGTH} ký tự.`;
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Mật khẩu xác nhận không khớp.";
  }

  if (Object.keys(errors).length > 0) {
    return { data: null, errors };
  }

  return { data: { displayName, username, password }, errors: null };
}

/**
 * Validate dữ liệu đăng nhập: chỉ cần cả hai trường không rỗng.
 * Sai tài khoản/mật khẩu được xử lý ở Server Action để tránh lộ thông tin.
 */
export function validateLoginInput(
  formData: FormData,
):
  | { data: LoginInput; errors: null }
  | { data: null; errors: AuthFieldErrors } {
  const username = readTextField(formData, "username");
  const password = readPasswordField(formData, "password");

  const errors: AuthFieldErrors = {};

  if (!username) {
    errors.username = "Vui lòng nhập tên đăng nhập.";
  }

  if (!password) {
    errors.password = "Vui lòng nhập mật khẩu.";
  }

  if (Object.keys(errors).length > 0) {
    return { data: null, errors };
  }

  return { data: { username, password }, errors: null };
}
