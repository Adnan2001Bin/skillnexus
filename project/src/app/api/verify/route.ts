// ===============================
// File: app/api/auth/verify/route.ts
// ===============================
import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/connectDB";
import UserModel from "@/models/user.model";

const VerifySchema = z.object({
  email: z.string().email({ message: "Invalid email" }).trim(),
  code: z.string().length(6, { message: "Code must be 6 digits" }),
});

export async function POST(req: Request) {
  await connectDB();
  try {
    const body = await req.json();
    const { email, code } = VerifySchema.parse(body);

    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 400 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { success: false, message: "Account already verified" },
        { status: 400 }
      );
    }

    if (!user.verificationCode || !user.verificationCodeExpires) {
      return NextResponse.json(
        { success: false, message: "No active verification code. Please resend." },
        { status: 400 }
      );
    }

    const now = new Date();
    if (user.verificationCode !== code) {
      return NextResponse.json(
        { success: false, message: "Invalid verification code" },
        { status: 400 }
      );
    }

    if (user.verificationCodeExpires < now) {
      return NextResponse.json(
        { success: false, message: "Verification code has expired" },
        { status: 400 }
      );
    }

    user.isVerified = true;
    user.verificationCode = null as any; // field allows string | null in schema default; cast for TS
    user.verificationCodeExpires = null as any;
    await user.save();

    return NextResponse.json(
      { success: true, message: "Email verified successfully." },
      { status: 200 }
    );
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: err.issues.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }
    console.error("/api/auth/verify error:", err);
    return NextResponse.json(
      { success: false, message: "Error verifying code" },
      { status: 500 }
    );
  }
}


