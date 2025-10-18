import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectDB from "@/lib/connectDB";
import OrderModel from "@/models/order.model";
import { z } from "zod";

const BodySchema = z.object({
  message: z.string().trim().optional().default(""),
  files: z
    .array(z.object({ name: z.string(), url: z.string().url(), size: z.number().optional() }))
    .optional()
    .default([]),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if ((session.user as any).role !== "freelancer") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { message, files } = BodySchema.parse(await req.json());

    const o = await OrderModel.findById(params.id);
    if (!o || String(o.freelancerId) !== String((session.user as any)._id)) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    if (o.projectStatus !== "approved") {
      return NextResponse.json(
        { success: false, message: "Only in-progress orders can be delivered" },
        { status: 400 }
      );
    }

    o.projectStatus = "completed";
    (o as any).deliveredAt = new Date();
    (o as any).deliveryMessage = message;
    (o as any).deliveryFiles = files;

    await o.save();

    // TODO: notify client via email / in-app notification

    return NextResponse.json({ success: true, message: "Delivered" }, { status: 200 });
  } catch (e: any) {
    if (e?.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: e.issues.map((i: any) => i.message).join(", ") },
        { status: 400 }
      );
    }
    console.error("POST /api/freelancer/orders/[id]/delivery error", e);
    return NextResponse.json({ success: false, message: "Failed to deliver" }, { status: 500 });
  }
}
