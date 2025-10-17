import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import { z } from "zod";
import OrderModel from "@/models/order.model";

const AnswerSchema = z.object({
  id: z.string().min(1),
  text: z.string().optional().nullable(),
  options: z.array(z.string()).optional().default([]),
  files: z
    .array(
      z.object({
        name: z.string(),
        size: z.number().optional(),
        url: z.string().url(), // 👈 URL from UploadThing
      })
    )
    .optional()
    .default([]),
});

const SubmitSchema = z.object({
  answers: z.array(AnswerSchema),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const { answers } = SubmitSchema.parse(body);

    const order = await OrderModel.findById(params.id);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }
    if (order.paymentStatus !== "paid") {
      return NextResponse.json({ success: false, message: "Payment required first" }, { status: 400 });
    }

    const ids = new Set((order.requirementsSnapshot || []).map((r: any) => r.id));
    order.requirementAnswers = (answers || []).filter((a) => ids.has(a.id));

    // remain pending until freelancer approves
    order.projectStatus = "pending";
    await order.save();

    return NextResponse.json({ success: true, message: "Requirements submitted" }, { status: 200 });
  } catch (e) {
    console.error("POST /api/client/orders/[id]/requirements error", e);
    return NextResponse.json({ success: false, message: "Failed to submit" }, { status: 500 });
  }
}
