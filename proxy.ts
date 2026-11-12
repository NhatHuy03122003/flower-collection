import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/session";

// Route yêu cầu đăng nhập
const PROTECTED_PATHS = ["/", "/flowers", "/members", "/my-flowers"];

// Route dành cho người chưa đăng nhập
const AUTH_PATHS = ["/login", "/signup"];

// Bảo vệ route theo kiểu "optimistic": chỉ kiểm tra sự tồn tại của cookie session.
// Đây không phải lớp bảo vệ dữ liệu duy nhất — dữ liệu thật luôn đọc qua server.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = Boolean(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const isAuthPage = AUTH_PATHS.some((path) => pathname === path);

  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
