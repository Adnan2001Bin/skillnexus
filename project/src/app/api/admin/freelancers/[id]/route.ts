// src/app/api/admin/freelancers/[id]/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import { categories } from "@/lib/freelance-categories";
import { z } from "zod";
import UserModel from "@/models/user.model";

const CATEGORY_MAP = new Map(categories.map((c) => [c.value, c.label]));

// --- GET (view one) ---
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const p = await UserModel.findById(params.id)
      .select(
        [
          "userName",
          "email",
          "role",
          "location",
          "profilePicture",
          "bio",
          "category",
          "services",
          "skills",
          "ratePlans",
          "portfolio",
          "aboutThisGig",
          "whatIOffer",
          "socialLinks",
          "languageProficiency",
          "requirements", // ⬅️ NEW: include requirements in admin view
          "approvalStatus",
          "rejectionReason",
          "reviewedAt",
          "createdAt",
          "updatedAt",
        ].join(" ")
      )
      .lean();

    if (!p || p.role !== "freelancer") {
      return NextResponse.json({ success: false, message: "Profile not found" }, { status: 404 });
    }

    const categoryLabel = p.category ? CATEGORY_MAP.get(p.category) ?? p.category : null;

    // Shape it to what your UI expects
    const profile = {
      ...p,
      _id: String(p._id),
      user: {
        _id: String(p._id),
        userName: p.userName,
        email: p.email,
      },
      categoryLabel,
    };

    return NextResponse.json({ success: true, profile }, { status: 200 });
  } catch (e) {
    console.error("GET /api/admin/freelancers/[id] error", e);
    return NextResponse.json({ success: false, message: "Failed to load profile" }, { status: 500 });
  }
}

// --- PATCH (approve / reject) ---
const PatchSchema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().trim().optional().default(""),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const body = await req.json();
    const { action, reason } = PatchSchema.parse(body);

    const p = await UserModel.findById(params.id);
    if (!p || p.role !== "freelancer") {
      return NextResponse.json({ success: false, message: "Profile not found" }, { status: 404 });
    }

    if (action === "approve") {
      p.approvalStatus = "approved";
      p.rejectionReason = null;
      p.reviewedAt = new Date();
    } else {
      p.approvalStatus = "rejected";
      p.rejectionReason = reason || null;
      p.reviewedAt = new Date();
    }

    await p.save();
    return NextResponse.json({ success: true, message: "Updated" }, { status: 200 });
  } catch (e: any) {
    if (e?.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: e.issues.map((i: any) => i.message).join(", ") },
        { status: 400 }
      );
    }
    console.error("PATCH /api/admin/freelancers/[id] error", e);
    return NextResponse.json({ success: false, message: "Failed to update" }, { status: 500 });
  }
}

// --- DELETE (remove profile / account) ---
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const p = await UserModel.findById(params.id);
    if (!p || p.role !== "freelancer") {
      return NextResponse.json({ success: false, message: "Profile not found" }, { status: 404 });
    }

    await UserModel.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "Deleted" }, { status: 200 });
  } catch (e) {
    console.error("DELETE /api/admin/freelancers/[id] error", e);
    return NextResponse.json({ success: false, message: "Failed to delete" }, { status: 500 });
  }
}
