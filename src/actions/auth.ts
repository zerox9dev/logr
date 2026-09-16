"use server";

import { cookies } from "next/headers";
import { PB_AUTH_COOKIE, createPb, toPbUser, type PbUser } from "@/lib/pocketbase";
import { getCurrentUser } from "@/lib/pocketbase-server";
import { cookieValue, setSessionCookie } from "@/lib/session-cookie";

export interface ActionResult {
  error?: string;
}

/** Sign-in/sign-up result. `user` lets the client seed its auth context from
 *  the same round-trip instead of firing a second Server Action. */
export interface AuthResult extends ActionResult {
  user?: PbUser;
}

function message(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string" && m) return m;
  }
  return fallback;
}

async function writeSessionCookie(value: string) {
  setSessionCookie(await cookies(), value);
}

export async function signInAction(email: string, password: string): Promise<AuthResult> {
  const pb = createPb();
  try {
    await pb.collection("users").authWithPassword(email.trim(), password);
  } catch (err) {
    return { error: message(err, "Invalid email or password.") };
  }
  const user = toPbUser(pb.authStore.record as Record<string, unknown> | null);
  if (!user) return { error: "Signed in, but the account could not be read." };
  await writeSessionCookie(cookieValue(pb.authStore.exportToCookie({ httpOnly: true }, PB_AUTH_COOKIE)));
  return { user };
}

/** True when PocketBase rejected `users.create` because the email is taken. */
function isDuplicateEmail(err: unknown): boolean {
  const data = (err as { response?: { data?: Record<string, { code?: string }> } })?.response?.data;
  const code = data?.email?.code;
  return code === "validation_not_unique" || code === "validation_invalid_email";
}

export interface SignUpResult extends AuthResult {
  /** Lets the client show a localized message instead of the English fallback. */
  emailTaken?: boolean;
}

export async function signUpAction(
  email: string,
  password: string,
  passwordConfirm: string,
): Promise<SignUpResult> {
  const trimmed = email.trim();
  const pb = createPb();
  try {
    await pb.collection("users").create({ email: trimmed, password, passwordConfirm });
  } catch (err) {
    if (isDuplicateEmail(err)) {
      return { error: "An account with this email already exists.", emailTaken: true };
    }
    return { error: message(err, "Could not create the account.") };
  }
  try {
    await pb.collection("users").authWithPassword(trimmed, password);
  } catch (err) {
    return { error: message(err, "Account created, but sign-in failed. Try signing in.") };
  }
  const user = toPbUser(pb.authStore.record as Record<string, unknown> | null);
  if (!user) return { error: "Account created, but sign-in failed. Try signing in." };
  await writeSessionCookie(cookieValue(pb.authStore.exportToCookie({ httpOnly: true }, PB_AUTH_COOKIE)));
  return { user };
}

export async function signOutAction(): Promise<ActionResult> {
  const cookieStore = await cookies();
  cookieStore.delete(PB_AUTH_COOKIE);
  return {};
}

export async function requestPasswordResetAction(email: string): Promise<ActionResult> {
  const pb = createPb();
  try {
    await pb.collection("users").requestPasswordReset(email.trim());
  } catch (err) {
    return { error: message(err, "Could not send the reset email.") };
  }
  return {};
}

export async function confirmPasswordResetAction(
  token: string,
  password: string,
  passwordConfirm: string,
): Promise<ActionResult> {
  const pb = createPb();
  try {
    await pb.collection("users").confirmPasswordReset(token, password, passwordConfirm);
  } catch (err) {
    return { error: message(err, "Could not reset the password. The link may have expired.") };
  }
  return {};
}

/** Current user for the client-side auth context. */
export async function getCurrentUserAction(): Promise<PbUser | null> {
  return getCurrentUser();
}
