import nodemailer from "nodemailer";

export async function sendOtpEmail(email: string, otp: string) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"SpeedMania" <noreply@speedmania.com>`;

  console.log(`[MAILER] OTP for ${email} is: ${otp}`);

  if (!host || !user || !pass) {
    console.warn("[MAILER] SMTP environment variables are not fully configured. Falling back to console logging OTP.");
    return { success: true, logged: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: port ? parseInt(port, 10) : 587,
      secure: port === "465",
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from,
      to: email,
      subject: "SpeedMania Password Reset OTP",
      text: `Your SpeedMania password reset verification OTP is: ${otp}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #000DFF; text-transform: uppercase; letter-spacing: 2px;">SpeedMania Verification</h2>
          <p>You have requested a password reset. Please use the following One-Time Password (OTP) to reset your password:</p>
          <div style="background-color: #f8f8f8; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #313131; border: 1px solid #eee; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #666; font-size: 14px;">This OTP is valid for 10 minutes. If you did not make this request, please ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[MAILER] Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[MAILER_ERROR]", error);
    return { success: false, error };
  }
}
