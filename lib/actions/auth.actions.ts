"use server";

import { db, users } from "@/lib/db";
import { eq, desc, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { verifyPassword, hashPassword } from "@/lib/auth/crypto.server";
import { signToken, verifyToken } from "@/lib/auth/crypto.edge";
import { redirect } from "next/navigation";

const COOKIE_NAME = "admin_session";
const USER_COOKIE_NAME = "user_session";

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

    if (!user || user.role !== "admin") {
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

export async function getUsersList(page: number = 1, limit: number = 10) {
  try {
    const offset = (page - 1) * limit;

    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const list = await db
        .select({
          id: users.id,
          username: users.username,
          role: users.role,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);

    return { users: list, total: Number(count) };
  } catch (error) {
    console.error("[AUTH_GET_USERS_LIST_ERROR]", error);
    throw new Error("Failed to fetch users");
  }
}

export async function deleteUser(userId: string) {
  try {
    // Note: We might also want to delete comments made by this user to avoid orphan foreign keys
    await db.delete(users).where(eq(users.id, userId));
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("[AUTH_DELETE_USER_ERROR]", error);
    return { success: false, error: "Failed to delete user" };
  }
}

// ── User / Driver Authentication ──

export async function loginUser(prevState: any, formData: FormData) {
  try {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
      return { success: false, error: "Username and password are required" };
    }

    const trimmedUsername = username.trim();
    const user = await db.query.users.findFirst({
      where: eq(users.username, trimmedUsername),
    });

    if (!user) {
      return { success: false, error: "Invalid username or password" };
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "Invalid username or password" };
    }

    const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    const payload = `${user.id}:${user.username}:${expiry}`;
    const token = await signToken(payload);

    const cookieStore = await cookies();
    cookieStore.set(USER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    return { success: true };
  } catch (error: any) {
    console.error("[AUTH_LOGIN_USER]", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function registerUser(prevState: any, formData: FormData) {
  try {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!username || !password || !confirmPassword) {
      return { success: false, error: "All fields are required" };
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3) {
      return { success: false, error: "Username must be at least 3 characters long" };
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long" };
    }

    if (password !== confirmPassword) {
      return { success: false, error: "Passwords do not match" };
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, trimmedUsername),
    });

    if (existingUser) {
      return { success: false, error: "Username is already taken" };
    }

    const passwordHash = hashPassword(password);
    const userId = crypto.randomUUID();

    await db.insert(users).values({
      id: userId,
      username: trimmedUsername,
      passwordHash,
      role: "driver", // Create as driver role
    });

    const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    const payload = `${userId}:${trimmedUsername}:${expiry}`;
    const token = await signToken(payload);

    const cookieStore = await cookies();
    cookieStore.set(USER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return { success: true };
  } catch (error: any) {
    console.error("[AUTH_REGISTER_USER]", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(USER_COOKIE_NAME);
    if (!tokenCookie || !tokenCookie.value) return null;

    const payload = await verifyToken(tokenCookie.value);
    if (!payload) return null;

    const [id, username, expiryStr] = payload.split(":");
    const expiry = parseInt(expiryStr, 10);

    if (Date.now() > expiry) {
      cookieStore.delete(USER_COOKIE_NAME);
      return null;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    if (!user) return null;

    return { id: user.id, username: user.username, role: user.role };
  } catch (error) {
    console.error("[AUTH_GET_CURRENT_USER]", error);
    return null;
  }
}

export async function logoutUser() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(USER_COOKIE_NAME);
  } catch (error) {
    console.error("[AUTH_LOGOUT_USER]", error);
  }
  redirect("/");
}
