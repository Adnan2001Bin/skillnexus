// src/app/api/admin/freelancers/[id]/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import FreelancerProfile from "@/models/freelancerProfile.model";
import { categories } from "@/lib/freelance-categories";
import { Types } from "mongoose";
import { z } from "zod";

const CATEGORY_MAP = new Map(categories.map((c) => [c.value, c.label]));

type PopulatedFreelancerLean = {
  _id: Types.ObjectId;
  user:
    | Types.ObjectId
    | {
        _id: Types.ObjectId;
        userName: string;
        email: string;
      };
  location?: string | null;
  profilePicture?: string | null;
  bio?: string | null;
  category?: string | null;
  services?: string[];
  skills?: string[];
  ratePlans?: Array<{ type: string; price: number }>;
  portfolio?: Array<any>;
  approvalStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string | null;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// --- GET (view one) ---
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const p = await FreelancerProfile.findById(params.id)
      .populate<{ user: { _id: Types.ObjectId; userName: string; email: string } }>(
        "user",
        "userName email"
      )
      .lean<PopulatedFreelancerLean>();

    if (!p) {
      return NextResponse.json({ success: false, message: "Profile not found" }, { status: 404 });
    }

    const categoryLabel = p.category ? CATEGORY_MAP.get(p.category) ?? p.category : null;
    const isPopUser = typeof p.user === "object" && p.user !== null && "_id" in p.user;

    const profile = {
      ...p,
      _id: String(p._id),
      user: isPopUser
        ? {
            _id: String((p.user as any)._id),
            userName: (p.user as any).userName,
            email: (p.user as any).email,
          }
        : null,
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

    const p = await FreelancerProfile.findById(params.id);
    if (!p) {
      return NextResponse.json({ success: false, message: "Profile not found" }, { status: 404 });
    }

    if (action === "approve") {
      p.approvalStatus = "approved";
      p.rejectionReason = null;
      p.reviewedAt = new Date();
    } else if (action === "reject") {
      p.approvalStatus = "rejected";
      p.rejectionReason = reason || null;
      p.reviewedAt = new Date();
    }

    await p.save();
    return NextResponse.json({ success: true, message: "Updated" }, { status: 200 });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: e.issues.map(i => i.message).join(", ") }, { status: 400 });
    }
    console.error("PATCH /api/admin/freelancers/[id] error", e);
    return NextResponse.json({ success: false, message: "Failed to update" }, { status: 500 });
  }
}

// --- DELETE (remove profile) ---
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const p = await FreelancerProfile.findByIdAndDelete(params.id);
    if (!p) {
      return NextResponse.json({ success: false, message: "Profile not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Deleted" }, { status: 200 });
  } catch (e) {
    console.error("DELETE /api/admin/freelancers/[id] error", e);
    return NextResponse.json({ success: false, message: "Failed to delete" }, { status: 500 });
  }
}
