import { createHmac, timingSafeEqual } from "node:crypto";

// Session đơn giản: chỉ lưu userId vào cookie httpOnly có chữ ký HMAC.
// Không dùng NextAuth/Clerk/Auth0 — chỉ cần "đã đăng nhập hay chưa".
// File này KHÔNG import `next/headers` để proxy.ts cũng dùng được.

export const SESSION_COOKIE = "rose_session";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 ngày

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
} as const;

function getSecret() {
  return process.env.SESSION_SECRET || "rose-flower-collection-dev-secret";
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createSessionToken(userId: string) {
  const payload = Buffer.from(userId, "utf8").toString("base64url");

  return `${payload}.${sign(payload)}`;
}

/**
 * Xác thực cookie session và trả về userId.
 * Trả về null nếu thiếu cookie, sai định dạng hoặc chữ ký không hợp lệ.
 */
export function verifySessionToken(
  token: string | null | undefined,
): string | null {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expected = sign(payload);
  const givenBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    givenBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(givenBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    return Buffer.from(payload, "base64url").toString("utf8");
  } catch {
    return null;
  }
}
