// src/app/api/freelancer/me/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectDB from "@/lib/connectDB";
import UserModel from "@/models/user.model";
import { categories } from "@/lib/freelance-categories";

const CATEGORY_MAP = new Map(categories.map((c) => [c.value, c.label]));

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // We DO NOT select password/verification fields (hidden in schema anyway).
    const user = await UserModel.findById((session.user as any)._id).lean();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Only freelancers should hit this page (you can relax this if you want).
    if (user.role !== "freelancer") {
      return NextResponse.json(
        { success: false, message: "Not a freelancer" },
        { status: 403 }
      );
    }

    // Attach derived label
    const categoryLabel = user.category
      ? CATEGORY_MAP.get(user.category) ?? user.category
      : null;

    const profile = {
      _id: String(user._id),
      userName: user.userName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,

      // Profile fields
      profilePicture: user.profilePicture ?? null,
      location: user.location ?? null,
      bio: user.bio ?? null,
      category: user.category ?? null,
      categoryLabel,
      services: user.services ?? [],
      skills: user.skills ?? [],
      portfolio: user.portfolio ?? [],
      ratePlans: user.ratePlans ?? [],
      aboutThisGig: user.aboutThisGig ?? null,
      whatIOffer: user.whatIOffer ?? [],
      socialLinks: user.socialLinks ?? [],
      languageProficiency: user.languageProficiency ?? [],

      // NEW: Requirements
      requirements: user.requirements ?? [],

      // Moderation
      approvalStatus: user.approvalStatus,
      rejectionReason: user.rejectionReason ?? null,
      reviewedAt: user.reviewedAt ?? null,

      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json({ success: true, profile }, { status: 200 });
  } catch (e) {
    console.error("GET /api/freelancer/me error", e);
    return NextResponse.json(
      { success: false, message: "Failed to load profile" },
      { status: 500 }
    );
  }
}
