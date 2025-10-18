import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectDB from "@/lib/connectDB";
import OrderModel from "@/models/order.model";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if ((session.user as any).role !== "freelancer") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const status = searchParams.get("status") || "";

    await connectDB();

    const where: any = { freelancerId: (session.user as any)._id };
    if (status) where.projectStatus = status;

    const textFilters: any[] = [];
    if (q) {
      textFilters.push(
        { clientEmail: { $regex: q, $options: "i" } },
        { orderNumber: { $regex: q, $options: "i" } },
        { planType: { $regex: q, $options: "i" } }
      );
    }
    const query = q ? { $and: [where, { $or: textFilters }] } : where;

    const list = await OrderModel
      .find(query)
      .sort({ createdAt: -1 })
      .lean();

    const payload = list.map((o) => ({
      id: String(o._id),
      orderNumber: o.orderNumber || null,
      clientEmail: o.clientEmail || null,
      planType: o.planType,
      price: o.price,
      paymentStatus: o.paymentStatus,
      projectStatus: o.projectStatus,
      createdAt: o.createdAt,
    }));

    return NextResponse.json({ success: true, list: payload }, { status: 200 });
  } catch (e) {
    console.error("GET /api/freelancer/orders error", e);
    return NextResponse.json({ success: false, message: "Failed to load orders" }, { status: 500 });
  }
}
