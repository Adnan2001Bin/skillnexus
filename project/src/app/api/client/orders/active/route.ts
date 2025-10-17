// src/app/api/client/orders/active/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectDB from "@/lib/connectDB";
import OrderModel from "@/models/order.model";
import { z } from "zod";

const QuerySchema = z.object({
  freelancerId: z.string().min(1, "freelancerId is required"),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const parsed = QuerySchema.safeParse({
      freelancerId: searchParams.get("freelancerId") || "",
    });
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues.map((i) => i.message).join(", "),
        },
        { status: 400 }
      );
    }

    const { freelancerId } = parsed.data;
    await connectDB();

    // "Active" = any order that is not completed/approved or cancelled.
    // If you later add "completed" as a distinct value, add it to the array below.
    const INACTIVE_STATUSES = ["approved", "cancelled", "completed"];
    const clientId = (session.user as any)._id;

    // Find the most recent still-active order between this client and this freelancer
    const activeOrder = await OrderModel.findOne({
      clientId,
      freelancerId,
      projectStatus: { $nin: INACTIVE_STATUSES },
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!activeOrder) {
      return NextResponse.json(
        { success: true, active: false, order: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        active: true,
        order: {
          id: String(activeOrder._id),
          projectStatus: activeOrder.projectStatus,
          paymentStatus: activeOrder.paymentStatus,
          planType: activeOrder.planType,
          price: activeOrder.price,
          createdAt: activeOrder.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("GET /api/client/orders/active error", e);
    return NextResponse.json(
      { success: false, message: "Failed to check active orders" },
      { status: 500 }
    );
  }
}
