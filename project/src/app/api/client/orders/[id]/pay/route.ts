import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import OrderModel from "@/models/order.model";

/**
 * Demo payment: we just flip paymentStatus to "paid".
 * In real life, verify gateway webhook here.
 */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const order = await OrderModel.findById(params.id);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }
    if (order.paymentStatus === "paid") {
      return NextResponse.json({ success: true, message: "Already paid" }, { status: 200 });
    }
    order.paymentStatus = "paid";
    await order.save();
    return NextResponse.json({ success: true, message: "Payment captured" }, { status: 200 });
  } catch (e) {
    console.error("POST /api/client/orders/[id]/pay error", e);
    return NextResponse.json({ success: false, message: "Payment failed" }, { status: 500 });
  }
}
