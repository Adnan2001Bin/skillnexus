// ===============================
// File: app/api/auth/resend/route.ts
// ===============================
import { NextResponse as Res } from "next/server";
import { z as Z } from "zod";
import connectDB2 from "@/lib/connectDB";
import UserModel2 from "@/models/user.model";
import { sendVerificationEmail } from "@/emails/VerificationEmail";

const ResendSchema = Z.object({
  email: Z.string().email({ message: "Invalid email" }).trim(),
  userName: Z.string().min(2).max(50).trim(),
});

export async function POST(req: Request) {
  await connectDB2();
  try {
    const body = await req.json();
    const { email, userName } = ResendSchema.parse(body);

    const user = await UserModel2.findOne({ email: email.toLowerCase() });
    if (!user) {
      return Res.json({ success: false, message: "User not found" }, { status: 400 });
    }

    if (user.isVerified) {
      return Res.json(
        { success: false, message: "Account already verified" },
        { status: 400 }
      );
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date(Date.now() + 10 * 60 * 1000);

    user.userName = userName; // optionally allow updating username before verify
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = expiryDate;
    await user.save();

    const emailResp = await sendVerificationEmail({
      email: email.toLowerCase(),
      userName,
      verificationCode,
    });

    if (!emailResp.success) {
      return Res.json(
        { success: false, message: emailResp.message || "Failed to send email" },
        { status: 500 }
      );
    }

    return Res.json(
      { success: true, message: "New verification code sent." },
      { status: 200 }
    );
  } catch (err: any) {
    if (err instanceof Z.ZodError) {
      return Res.json(
        { success: false, message: err.issues.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }
    console.error("/api/auth/resend error:", err);
    return Res.json(
      { success: false, message: "Error resending code" },
      { status: 500 }
    );
  }
}