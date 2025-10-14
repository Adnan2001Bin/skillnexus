import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import UserModel from "@/models/user.model";
import { categories } from "@/lib/freelance-categories";

const CATEGORY_MAP = new Map(categories.map(c => [c.value, c.label]));

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  try {
    const u = await UserModel.findById(params.id)
      .select(
        "role approvalStatus userName email profilePicture location category services skills portfolio ratePlans bio aboutThisGig whatIOffer socialLinks languageProficiency createdAt updatedAt"
      )
      .lean();

    if (!u || u.role !== "freelancer" || u.approvalStatus !== "approved") {
      return NextResponse.json({ success: false, message: "Profile not found" }, { status: 404 });
    }

    const profile = {
      _id: String(u._id),
      userName: u.userName,
      email: u.email,
      profilePicture: u.profilePicture || null,
      location: u.location || null,
      category: u.category || null,
      categoryLabel: u.category ? CATEGORY_MAP.get(u.category) ?? u.category : null,
      services: u.services || [],
      skills: u.skills || [],
      portfolio: u.portfolio || [],
      ratePlans: u.ratePlans || [],
      aboutThisGig: u.aboutThisGig || null,
      whatIOffer: u.whatIOffer || [],
      socialLinks: u.socialLinks || [],
      languageProficiency: u.languageProficiency || [],
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    };

    return NextResponse.json({ success: true, profile });
  } catch (err) {
    console.error("GET /api/client/freelancers/[id] error", err);
    return NextResponse.json({ success: false, message: "Failed to load profile" }, { status: 500 });
  }
}
