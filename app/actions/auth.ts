"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { clearCurrentMemberId } from "@/lib/current-member";
import { clearUserSession, setUserSession } from "@/lib/current-user";
import { notifyAdminsPendingMemberSafely } from "@/lib/notification";
import {
  createUser,
  getUserByUsername,
  hashPassword,
  isUsernameTaken,
  validateLoginInput,
  validateSignupInput,
  verifyPassword,
} from "@/lib/user";
import type { AuthActionState } from "@/lib/user";

export async function signupAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const { data, errors } = validateSignupInput(formData);

  if (!data) {
    return { status: "error", errors };
  }

  if (await isUsernameTaken(data.username)) {
    return {
      status: "error",
      errors: { username: "Tên đăng nhập này đã tồn tại." },
    };
  }

  const passwordHash = await hashPassword(data.password);

  const createdUser = await createUser({
    username: data.username,
    displayName: data.displayName,
    passwordHash,
  });

  if (createdUser.role === "USER") {
    await notifyAdminsPendingMemberSafely(createdUser);
  }

  redirect("/login?toast=signup-success");
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const { data, errors } = validateLoginInput(formData);

  if (!data) {
    return { status: "error", errors };
  }

  const user = await getUserByUsername(data.username);

  if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
    return {
      status: "error",
      errors: { form: "Tên đăng nhập hoặc mật khẩu không đúng." },
    };
  }

  await setUserSession(user.id);
  revalidatePath("/", "layout");

  redirect("/?toast=login-success");
}

export async function logoutAction() {
  await clearUserSession();
  await clearCurrentMemberId();
  revalidatePath("/", "layout");

  redirect("/login");
}
