import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import { z } from "zod";
import UserModel from "@/models/user.model";
import OrderModel from "@/models/order.model";

const CreateOrderSchema = z.object({
  freelancerId: z.string().min(1),
  planType: z.enum(["Basic", "Standard", "Premium"]),
  // optional client info for demo (replace with session in real app)
  clientEmail: z.string().email().optional(),
});

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { freelancerId, planType, clientEmail } = CreateOrderSchema.parse(body);

    // Load freelancer with ratePlans + requirements snapshot
    const freelancer = await UserModel.findById(freelancerId)
      .select([
        "userName",
        "ratePlans",
        "requirements", // ← ensure you added this to User model
      ].join(" "))
      .lean();

    if (!freelancer ) {
      return NextResponse.json({ success: false, message: "Freelancer not found" }, { status: 404 });
    }

    const plan = (freelancer.ratePlans || []).find((p: any) => p.type === planType);
    if (!plan) {
      return NextResponse.json({ success: false, message: "Plan not available" }, { status: 400 });
    }

    const price = Number(plan.price || 0);

    const order = await OrderModel.create({
      clientId: null, // wire session later
      clientEmail: clientEmail || null,

      freelancerId: freelancer._id,
      freelancerName: freelancer.userName,
      planType,
      price,

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
