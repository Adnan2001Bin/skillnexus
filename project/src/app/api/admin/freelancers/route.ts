// src/app/api/admin/freelancers/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import FreelancerProfile from "@/models/freelancerProfile.model";
import UserModel from "@/models/user.model";
import { categories } from "@/lib/freelance-categories";

const CATEGORY_MAP = new Map(categories.map(c => [c.value, c.label]));

export async function GET(req: Request) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const status = (searchParams.get("status") || "").trim() as
      | ""
      | "pending"
      | "approved"
      | "rejected";

    const filter: any = {};
    if (status) filter.approvalStatus = status;

    // If you also want to search by user fields, we can do it after populate.
    const profiles = await FreelancerProfile.find(filter)
      .populate("user", "userName email")
      .sort({ createdAt: -1 })
      .lean();

    // Optional client-side-like text search (simple & fast enough for admin lists)
    const matchesQ = (p: any) => {
      if (!q) return true;
      const hay = [
        p?.user?.userName,
        p?.user?.email,
        p?.category,
        ...(p?.services || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q.toLowerCase());
    };

    const list = profiles.filter(matchesQ).map((p: any) => {
      const categoryLabel =
        p.category ? CATEGORY_MAP.get(p.category) ?? p.category : null;

      return {
        _id: String(p._id),
        user: String(p.user?._id || ""),
        userName: p.user?.userName || "",
        email: p.user?.email || "",
        location: p.location || null,
        profilePicture: p.profilePicture || null,
        category: p.category || null,
        categoryLabel, // <-- ADDED
        services: p.services || [],
        skills: p.skills || [],
        portfolioCount: Array.isArray(p.portfolio) ? p.portfolio.length : 0,
        ratePlans: (p.ratePlans || []).map((r: any) => ({
          type: r.type,
          price: r.price,
        })),
        approvalStatus: p.approvalStatus || "pending",
        rejectionReason: p.rejectionReason || null,
        reviewedAt: p.reviewedAt ? new Date(p.reviewedAt).toISOString() : null,
        createdAt: new Date(p.createdAt).toISOString(),
        updatedAt: new Date(p.updatedAt).toISOString(),
      };
    });

    return NextResponse.json({ success: true, list }, { status: 200 });
  } catch (e) {
    console.error("GET /api/admin/freelancers error", e);
    return NextResponse.json(
      { success: false, message: "Failed to load freelancers" },
      { status: 500 }
    );
  }
}
