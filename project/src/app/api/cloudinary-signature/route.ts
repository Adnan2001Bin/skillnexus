import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,        // server-side key (NOT public)
  api_secret: process.env.CLOUDINARY_API_SECRET,  // server-side secret
});

export async function POST() {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = "skillconnect";
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET!
    );
    return NextResponse.json({ signature, timestamp, folder }, { status: 200 });
  } catch (err) {
    console.error("Cloudinary signature error:", err);
    return NextResponse.json({ error: "Failed to generate signature" }, { status: 500 });
  }
}
