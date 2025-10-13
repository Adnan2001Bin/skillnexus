// app/api/onboarding/client/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/connectDB";
import UserModel from "@/models/user.model";

const ClientSchema = z.object({
  email: z.string().email(),
  location: z.string().trim().optional(),
  profilePicture: z.string().url().optional(),
  companyName: z.string().trim().optional(),
  website: z.string().url().optional(),
  about: z.string().trim().max(500).optional(),
});

export async function POST(req: Request) {
  await connectDB();
  try {
    const raw = await req.json();
    const data = ClientSchema.parse(raw);

    // In production, derive the user from session/JWT and ignore body.email
    const user = await UserModel.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    if (user.role !== "client") {
      return NextResponse.json(
        { success: false, message: "Not a client" },
        { status: 400 }
      );
    }

    // Build update patch (nulls are fine to clear fields on the unified User)
    const patch: Partial<{
      location: string | null;
      profilePicture: string | null;
      companyName: string | null;
      website: string | null;
      about: string | null;
    }> = {
      location: data.location ?? null,
      profilePicture: data.profilePicture ?? null,
      companyName: data.companyName ?? null,
      website: data.website ?? null,
      about: data.about ?? null,
    };

    // Update the existing User document
    await UserModel.findOneAndUpdate(
      { _id: user._id },    // <-- FIXED: filter by _id
      patch,
      { new: true }         // no upsert needed, user exists
    );

    return NextResponse.json(
      { success: true, message: "Client profile saved" },
      { status: 200 }
    );
  } catch (e: unknown) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: e.issues.map((x) => x.message).join(", ") },
        { status: 400 }
      );
    }
    console.error("client onboarding error", e);
    return NextResponse.json(
      { success: false, message: "Error saving profile" },
      { status: 500 }
    );
  }
}
