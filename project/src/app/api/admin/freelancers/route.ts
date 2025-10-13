// src/app/api/admin/freelancers/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
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

    // Base filter: freelancers only
    const filter: any = { role: "freelancer" };
    if (status) filter.approvalStatus = status;

    // Optional server-side search (hits your text + field indexes)
    if (q) {
      const rx = new RegExp(q, "i");
      filter.$or = [
        { userName: rx },
        { email: rx },
        { category: rx },
        { services: { $elemMatch: { $regex: rx } } },
        { skills: { $elemMatch: { $regex: rx } } },
      ];
      // If you prefer MongoDB text index search instead of regex:
      // filter.$text = { $search: q };  // and ensure your text index exists
    }

    const users = await UserModel.find(filter)
      // password, verificationCode, verificationCodeExpires have select:false
      // but you can still be explicit about what you want to return:
      .select([
        "userName",
        "email",
        "location",
        "profilePicture",
        "category",
        "services",
        "skills",
        "portfolio",
        "ratePlans",
        "approvalStatus",
        "rejectionReason",
        "reviewedAt",
        "createdAt",
        "updatedAt",
      ].join(" "))
      .sort({ createdAt: -1 })
      .lean();

    const list = users.map((p: any) => {
      const categoryLabel = p.category ? (CATEGORY_MAP.get(p.category) ?? p.category) : null;
      return {
        _id: String(p._id),
        user: String(p._id),                 // kept for UI compatibility
        userName: p.userName || "",
        email: p.email || "",
        location: p.location ?? null,
        profilePicture: p.profilePicture ?? null,
        category: p.category ?? null,
        categoryLabel,
        services: p.services || [],
        skills: p.skills || [],
        portfolioCount: Array.isArray(p.portfolio) ? p.portfolio.length : 0,
        ratePlans: (p.ratePlans || []).map((r: any) => ({ type: r.type, price: r.price })),
        approvalStatus: p.approvalStatus || "pending",
        rejectionReason: p.rejectionReason ?? null,
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
