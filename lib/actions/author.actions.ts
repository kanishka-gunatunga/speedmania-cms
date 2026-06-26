"use server";

import { db, users, authorProfiles } from "@/lib/db";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/crypto.server";
import { signToken } from "@/lib/auth/crypto.edge";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const USER_COOKIE_NAME = "user_session";

export async function registerAuthor(prevState: any, formData: FormData) {
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
      role: "author", // Create as author role
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
    console.error("[AUTH_REGISTER_AUTHOR]", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function submitAuthorProfile(prevState: any, formData: FormData) {
  try {
    const userId = formData.get("userId") as string;
    const fullName = formData.get("fullName") as string;
    const bio = formData.get("bio") as string;
    const avatarUrl = formData.get("avatarUrl") as string;

    if (!userId || !fullName) {
      return { success: false, error: "Full Name is required" };
    }

    const existingProfile = await db.query.authorProfiles.findFirst({
      where: eq(authorProfiles.userId, userId),
    });

    if (existingProfile) {
      await db.update(authorProfiles).set({
        fullName,
        bio: bio || null,
        avatarUrl: avatarUrl || null,
        updatedAt: new Date(),
      }).where(eq(authorProfiles.userId, userId));
    } else {
      let slug = fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      let finalSlug = slug;
      let counter = 1;
      while (true) {
        const existingSlug = await db.query.authorProfiles.findFirst({
          where: eq(authorProfiles.slug, finalSlug),
        });
        if (!existingSlug) break;
        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      await db.insert(authorProfiles).values({
        id: crypto.randomUUID(),
        userId,
        fullName,
        bio: bio || null,
        avatarUrl: avatarUrl || null,
        slug: finalSlug,
      });
    }

    revalidatePath("/author/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[SUBMIT_AUTHOR_PROFILE]", error);
    return { success: false, error: "Something went wrong saving the profile." };
  }
}
