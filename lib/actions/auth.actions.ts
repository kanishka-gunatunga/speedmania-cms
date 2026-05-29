"use server";

import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { verifyPassword } from "@/lib/auth/crypto.server";
import { signToken, verifyToken } from "@/lib/auth/crypto.edge";
import { redirect } from "next/navigation";

const COOKIE_NAME = "admin_session";

export async function loginAdmin(prevState: any, formData: FormData) {
  try {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
      return { success: false, error: "Username and password are required" };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!user) {
      return { success: false, error: "Invalid username or password" };
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "Invalid username or password" };
    }

    // Set signed session token: userId:username:expiry (awaited asynchronous Web Crypto call)
    const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    const payload = `${user.id}:${user.username}:${expiry}`;
    const token = await signToken(payload);

    // Set HTTP-Only Cookie
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    return { success: true };
  } catch (error: any) {
    console.error("[AUTH_LOGIN_ADMIN]", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function logoutAdmin() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
  } catch (error) {
    console.error("[AUTH_LOGOUT_ADMIN]", error);
  }
  redirect("/admin/login");
}

export async function getCurrentAdmin() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(COOKIE_NAME);
    if (!tokenCookie || !tokenCookie.value) return null;

    // Await asynchronous Edge-compatible token verification
    const payload = await verifyToken(tokenCookie.value);
    if (!payload) return null;

    const [id, username, expiryStr] = payload.split(":");
    const expiry = parseInt(expiryStr, 10);

    if (Date.now() > expiry) {
      // Session expired, clean up cookie
      cookieStore.delete(COOKIE_NAME);
      return null;
    }

    return { id, username };
  } catch (error) {
    console.error("[AUTH_GET_CURRENT_ADMIN]", error);
    return null;
  }
}
