import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/connectDB";
import UserModel from "@/models/user.model";
import ClientProfile from "@/models/clientProfile.model";

const ClientSchema = z.object({
  email: z.string().email(),
  location: z.string().min(1).optional(),
  profilePicture: z.string().url().optional(),
  companyName: z.string().optional(),
  website: z.string().url().optional(),
  about: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  await connectDB();
  try {
    const data = ClientSchema.parse(await req.json());
    const user = await UserModel.findOne({ email: data.email.toLowerCase() });
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    if (user.role !== "client") return NextResponse.json({ success: false, message: "Not a client" }, { status: 400 });

    const payload = {
      user: user._id,
      location: data.location ?? null,
      profilePicture: data.profilePicture ?? null,
      companyName: data.companyName ?? null,
      website: data.website ?? null,
      about: data.about ?? null,
    };

    await ClientProfile.findOneAndUpdate({ user: user._id }, payload, { upsert: true, new: true });
    return NextResponse.json({ success: true, message: "Client profile saved" }, { status: 200 });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: e.issues.map(x => x.message).join(", ") }, { status: 400 });
    }
    console.error("client onboarding error", e);
    return NextResponse.json({ success: false, message: "Error saving profile" }, { status: 500 });
  }
}
