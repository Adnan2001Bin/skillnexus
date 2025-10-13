// app/api/onboarding/freelancer/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/connectDB";
import UserModel from "@/models/user.model";

const CATEGORY_VALUES = [
  "programming_tech",
  "graphics_design",
  "digital_marketing",
  "video_animation",
  "ai_services",
  "business",
  "writing_translation",
  "consulting",
] as const;

// Option A: strict to match typical Mongoose "required" intent
const RatePlan = z.object({
  type: z.enum(["Basic", "Standard", "Premium"]),
  price: z.number().min(0),
  description: z.string().trim().min(1, "Description is required"),
  whatsIncluded: z.array(z.string().trim().min(1)).min(1, "At least 1 item"),
  deliveryDays: z.number().min(1),
  revisions: z.number().min(0),
});

const PortfolioItem = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  imageUrl: z.string().url().optional(),
  projectUrl: z.string().url().optional(),
});

const FreelancerSchema = z.object({
  email: z.string().email(),
  location: z.string().trim().optional().default(""),
  profilePicture: z.string().url().optional(),
  bio: z.string().trim().max(1000).optional().default(""),
  category: z.enum(CATEGORY_VALUES).optional(),
  services: z.array(z.string().trim()).optional().default([]),

  skills: z.array(z.string().trim()).optional().default([]),
  languageProficiency: z.array(z.string().trim()).optional().default([]),
  whatIOffer: z.array(z.string().trim()).optional().default([]),
  socialLinks: z
    .array(z.object({ platform: z.string().trim(), url: z.string().url() }))
    .optional()
    .default([]),

  portfolio: z.array(PortfolioItem).optional().default([]),
  ratePlans: z.array(RatePlan).optional().default([]),
  aboutThisGig: z.string().trim().max(1500).optional().default(""),
});

function distinctStrings(arr: string[] | undefined) {
  return Array.from(new Set((arr || []).map((s) => s.trim()).filter(Boolean)));
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const raw = await req.json();

    // defensive coercion if inputs arrive as strings
    if (Array.isArray(raw?.ratePlans)) {
      raw.ratePlans = raw.ratePlans.map((p: any) => ({
        ...p,
        price: typeof p.price === "string" ? Number(p.price) : p.price,
        deliveryDays:
          typeof p.deliveryDays === "string" ? Number(p.deliveryDays) : p.deliveryDays,
        revisions:
          typeof p.revisions === "string" ? Number(p.revisions) : p.revisions,
      }));
    }

    const data = FreelancerSchema.parse(raw);

    // IMPORTANT: in prod, get the user from session/JWT, not from body.email
    const email = data.email.toLowerCase();
    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    if (user.role !== "freelancer") {
      return NextResponse.json(
        { success: false, message: "Not a freelancer" },
        { status: 400 }
      );
    }

    const portfolio = (data.portfolio || []).filter(
      (p) => p.title?.trim() && p.description?.trim()
    );

    const services = distinctStrings(data.services);
    const skills = distinctStrings(data.skills);
    const languageProficiency = distinctStrings(data.languageProficiency);
    const whatIOffer = distinctStrings(data.whatIOffer);

    await UserModel.findOneAndUpdate(
      { _id: user._id }, // <-- FIXED: update this user doc
      {
        location: data.location || null,
        profilePicture: data.profilePicture || null,
        bio: data.bio || null,
        category: data.category || null,
        services,
        skills,
        portfolio,
        ratePlans: data.ratePlans || [],
        aboutThisGig: data.aboutThisGig || null,
        whatIOffer,
        socialLinks: data.socialLinks || [],
        languageProficiency,
      },
      { new: true } // upsert not needed for existing user
    );

    return NextResponse.json(
      { success: true, message: "Freelancer profile saved" },
      { status: 200 }
    );
  } catch (e: unknown) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: e.issues.map((x) => x.message).join(", ") },
        { status: 400 }
      );
    }
    console.error("freelancer onboarding error", e);
    return NextResponse.json(
      { success: false, message: "Error saving profile" },
      { status: 500 }
    );
  }
}
