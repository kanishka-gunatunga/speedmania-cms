import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/crypto.server";
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

    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.username, trimmedUsername),
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Create token
    const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
    const payload = `${user.id}:${user.username}:${expiry}`;
    const token = await signToken(payload);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("[LOGIN_API_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
