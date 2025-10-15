import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/connectDB";
import UserModel from "@/models/user.model";

/**
 * GET /api/client/me
 * Returns the authenticated client's minimal profile (avatar, name, email, etc.)
 */
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // token.sub typically holds the user's _id
    const user = await UserModel.findById(token.sub)
      .select("userName email role profilePicture companyName website about location")
      .lean();

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: String(user._id),
          userName: user.userName,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture ?? null,
          companyName: user.companyName ?? null,
          website: user.website ?? null,
          about: user.about ?? null,
          location: user.location ?? null,
        },
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("GET /api/client error", e);
    return NextResponse.json(
      { success: false, message: "Failed to load profile" },
      { status: 500 }
    );
  }
}
