import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/crypto.server";
import { signToken } from "@/lib/auth/crypto.edge";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
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

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, trimmedUsername),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);
    const userId = crypto.randomUUID();

    // Create user with "fan" role
    await db.insert(users).values({
      id: userId,
      username: trimmedUsername,
      passwordHash,
      role: "fan",
    });

    // Create token
    const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
    const payload = `${userId}:${trimmedUsername}:${expiry}`;
    const token = await signToken(payload);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: userId,
        username: trimmedUsername,
        role: "fan",
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
