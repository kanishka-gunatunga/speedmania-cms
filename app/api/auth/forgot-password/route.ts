import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { sendOtpEmail } from "@/lib/mail/mailer";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if user exists with the given email
    const user = await db.query.users.findFirst({
      where: eq(users.email, trimmedEmail),
    });

    if (!user) {
      return NextResponse.json(
        { error: "No user found with this email address" },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update database
    await db.update(users)
      .set({
        otp,
        otpExpiry,
      })
      .where(eq(users.id, user.id));

    // Send email via nodemailer (or log to console if not configured)
    const mailResult = await sendOtpEmail(trimmedEmail, otp);

    if (!mailResult.success) {
      console.error("[OTP_SEND_ERROR] Failed to send OTP email:", mailResult.error);
      // We still return success: true in dev fallback or handle it gracefully
    }

    return NextResponse.json({
      success: true,
      message: "An OTP has been sent to your email address",
    });
  } catch (error: any) {
    console.error("[FORGOT_PASSWORD_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
