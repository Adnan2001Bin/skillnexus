// src/app/api/public/freelancers/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import UserModel from "@/models/user.model";
import { categories } from "@/lib/freelance-categories";

const CATEGORY_MAP = new Map(categories.map(c => [c.value, c.label]));

/**
 * GET /api/public/freelancers?q=...&category=...&services=a,b,c&page=1&limit=12
 * Returns only approved freelancer profiles (public, read-only).
 */
export async function GET(req: Request) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();
    const category = (searchParams.get("category") || "").trim();
    const servicesParam = (searchParams.get("services") || "").trim();
    const serviceFilter = servicesParam
      ? servicesParam.split(",").map(s => s.trim()).filter(Boolean)
      : [];

    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "12", 10), 1), 50);

    // Only approved freelancers
    const filter: any = { role: "freelancer", approvalStatus: "approved" };
    if (category) filter.category = category;

    // Pre-filter in Mongo if services provided (match any)
    if (serviceFilter.length) {
      filter.services = { $in: serviceFilter };
    }

    const docs = await UserModel.find(filter)
      .select(
        "userName email profilePicture location category services skills portfolio ratePlans bio aboutThisGig updatedAt"
      )
      .sort({ updatedAt: -1 })
      .lean();

    // Text search (simple clientish filtering on the server)
    const searched = q
      ? docs.filter((u: any) => {
          const hay = [
            u.userName,
            u.email,
            u.location,
            u.category,
            ...(u.services || []),
            ...(u.skills || []),
            u.bio,
            u.aboutThisGig,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        })
      : docs;

    const total = searched.length;
    const start = (page - 1) * limit;

    const items = searched.slice(start, start + limit).map((u: any) => ({
      _id: String(u._id),
      userName: u.userName,
      email: u.email,
      profilePicture: u.profilePicture || null,
      location: u.location || null,
      category: u.category || null,
      categoryLabel: u.category ? CATEGORY_MAP.get(u.category) ?? u.category : null,
      services: u.services || [],
      skills: u.skills || [],
      portfolioCount: Array.isArray(u.portfolio) ? u.portfolio.length : 0,
      minPrice:
        Array.isArray(u.ratePlans) && u.ratePlans.length
          ? Math.min(...u.ratePlans.map((r: any) => Number(r?.price || 0)))
          : null,
      bio: u.bio || null,
    }));

    return NextResponse.json(
      { success: true, page, limit, total, items },
      { status: 200 }
    );
  } catch (e) {
    console.error("GET /api/public/freelancers error", e);
    return NextResponse.json(
      { success: false, message: "Failed to load freelancers" },
      { status: 500 }
    );
  }
}
