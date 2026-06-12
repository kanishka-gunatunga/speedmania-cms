import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/crypto.server";
import { signToken } from "@/lib/auth/crypto.edge";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { username, email, password, role } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters long" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Determine role (only support fan or driver)
    const assignedRole = role === "driver" ? "driver" : "fan";

    // Check if username already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, trimmedUsername),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await db.query.users.findFirst({
      where: eq(users.email, trimmedEmail),
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);
    const userId = crypto.randomUUID();

    // Create user with selected role and email
    await db.insert(users).values({
      id: userId,
      username: trimmedUsername,
      email: trimmedEmail,
      passwordHash,
      role: assignedRole,
    });

    // Create token
    const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
    const payload = `${userId}:${trimmedUsername}:${expiry}`;
    const token = await signToken(payload);

    // Set cookie for session sharing on same domain
    const cookieStore = await cookies();
    cookieStore.set("user_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: userId,
        username: trimmedUsername,
        email: trimmedEmail,
        role: assignedRole,
      },
    });
  } catch (error: any) {
    console.error("[REGISTER_API_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

