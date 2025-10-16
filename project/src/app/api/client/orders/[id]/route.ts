import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import OrderModel from "@/models/order.model";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const order = await OrderModel.findById(params.id).lean();
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(
      {
        success: true,
        order: {
          id: String(order._id),
          price: order.price,
          planType: order.planType,
          paymentStatus: order.paymentStatus,
          projectStatus: order.projectStatus,
          requirementsSnapshot: order.requirementsSnapshot || [],
          requirementAnswers: order.requirementAnswers || [],
        },
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("GET /api/client/orders/[id] error", e);
    return NextResponse.json({ success: false, message: "Failed to load order" }, { status: 500 });
  }
}
