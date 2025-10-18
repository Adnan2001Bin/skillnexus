import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectDB from "@/lib/connectDB";
import OrderModel from "@/models/order.model";
import { z } from "zod";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if ((session.user as any).role !== "freelancer") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const o = await OrderModel.findById(params.id).lean();
    if (!o || String(o.freelancerId) !== String((session.user as any)._id)) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: String(o._id),
        orderNumber: o.orderNumber || null,
        clientEmail: o.clientEmail || null,
        planType: o.planType,
        price: o.price,
        paymentStatus: o.paymentStatus,
        projectStatus: o.projectStatus,
        createdAt: o.createdAt,
        requirementsSnapshot: o.requirementsSnapshot || [],
        requirementAnswers: o.requirementAnswers || [],
      },
    }, { status: 200 });
  } catch (e) {
    console.error("GET /api/freelancer/orders/[id] error", e);
    return NextResponse.json({ success: false, message: "Failed to load order" }, { status: 500 });
  }
}

const PatchSchema = z.object({
  action: z.enum(["accept", "reject", "deliver"]),
  reason: z.string().trim().optional().default(""),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if ((session.user as any).role !== "freelancer") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    const { action, reason } = PatchSchema.parse(body);

    const o = await OrderModel.findById(params.id);
    if (!o || String(o.freelancerId) !== String((session.user as any)._id)) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // Only allow state transitions from valid states
    if (action === "accept") {
      if (o.projectStatus !== "pending") {
        return NextResponse.json({ success: false, message: "Order cannot be accepted" }, { status: 400 });
      }
      o.projectStatus = "approved"; // in progress
    } else if (action === "reject") {
      if (o.projectStatus !== "pending") {
        return NextResponse.json({ success: false, message: "Order cannot be rejected" }, { status: 400 });
      }
      o.projectStatus = "cancelled";
      // (Optional) you could persist a rejectionReason field if desired
      // (Not in schema now)
    } else if (action === "deliver") {
      if (o.projectStatus !== "approved") {
        return NextResponse.json({ success: false, message: "Only in-progress orders can be delivered" }, { status: 400 });
      }
      o.projectStatus = "completed";
      // If later you want to attach delivery files/notes, extend schema and set here.
    }

    await o.save();
    return NextResponse.json({ success: true, message: "Updated" }, { status: 200 });
  } catch (e: any) {
    if (e?.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: e.issues.map((i: any) => i.message).join(", ") },
        { status: 400 }
      );
    }
    console.error("PATCH /api/freelancer/orders/[id] error", e);
    return NextResponse.json({ success: false, message: "Failed to update order" }, { status: 500 });
  }
}
