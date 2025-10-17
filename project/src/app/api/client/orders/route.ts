import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import { z } from "zod";
import UserModel from "@/models/user.model";
import OrderModel from "@/models/order.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const CreateOrderSchema = z.object({
  freelancerId: z.string().min(1),
  planType: z.enum(["Basic", "Standard", "Premium"]),
  clientEmail: z.string().email().optional(), // demo only if not logged in
});

// ---------- GET (list) ----------
export async function GET(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const emailParam = searchParams.get("email");

    // Try session first
    let clientFilter: any = {};
    if (session?.user?._id) {
      clientFilter.clientId = (session.user as any)._id;
    } else if (emailParam) {
      clientFilter.clientEmail = emailParam.toLowerCase();
    } else {
      // demo fallback (DO NOT leave for production)
      return NextResponse.json(
        { success: false, message: "Unauthorized: supply ?email= for demo or sign in." },
        { status: 401 }
      );
    }

    const orders = await OrderModel.find(clientFilter)
      .sort({ createdAt: -1 })
      .select([
        "freelancerId",
        "freelancerName",
        "planType",
        "price",
        "paymentStatus",
        "projectStatus",
        "createdAt",
        "updatedAt",
      ].join(" "))
      .lean();

    return NextResponse.json({
      success: true,
      orders: (orders || []).map((o) => ({
        id: String(o._id),
        freelancerName: o.freelancerName,
        planType: o.planType,
        price: o.price,
        paymentStatus: o.paymentStatus,
        projectStatus: o.projectStatus,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      })),
    });
  } catch (e) {
    console.error("GET /api/client/orders error", e);
    return NextResponse.json({ success: false, message: "Failed to load orders" }, { status: 500 });
  }
}

// ---------- POST (create) ----------
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { freelancerId, planType, clientEmail } = CreateOrderSchema.parse(body);

    // Load freelancer
    const freelancer = await UserModel.findById(freelancerId)
      .select(["userName", "ratePlans", "requirements"].join(" "))
      .lean();

    if (!freelancer ) {
      return NextResponse.json({ success: false, message: "Freelancer not found" }, { status: 404 });
    }

    const plan = (freelancer.ratePlans || []).find((p: any) => p.type === planType);
    if (!plan) {
      return NextResponse.json({ success: false, message: "Plan not available" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);

    const order = await OrderModel.create({
      clientId: session?.user?._id || null,
      clientEmail: session?.user?.email || clientEmail || null,
      freelancerId: freelancer._id,
      freelancerName: freelancer.userName,
      planType,
      price: Number(plan.price || 0),
      paymentStatus: "unpaid",
      projectStatus: "pending",
      requirementsSnapshot: freelancer.requirements || [],
      requirementAnswers: [],
    });

    return NextResponse.json(
      {
        success: true,
        order: {
          id: String(order._id),
          price: order.price,
          planType: order.planType,
          paymentStatus: order.paymentStatus,
          projectStatus: order.projectStatus,
        },
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("POST /api/client/orders error", e);
    return NextResponse.json({ success: false, message: "Failed to create order" }, { status: 500 });
  }
}
