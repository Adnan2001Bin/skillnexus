// src/models/order.model.ts
import mongoose, { Schema, Types, Document } from "mongoose";

/** --- Types that mirror your freelancer requirements schema --- */
export type RequirementType =
  | "text"
  | "textarea"
  | "multiple_choice"
  | "file"
  | "instructions";

export interface IRequirement {
  id: string;
  type: RequirementType;
  question?: string | null;
  helperText?: string | null;
  required?: boolean;
  options?: string[];
  allowMultiple?: boolean;
  accepts?: string[];
  maxFiles?: number | null;
  content?: string | null;
}

export interface IRequirementAnswer {
  id: string;
  text?: string | null;
  options?: string[];
  files?: { name: string; size?: number; url: string }[];
}

export interface IOrder extends Document {
  _id: Types.ObjectId;

  orderNumber?: string | null;

  clientId?: Types.ObjectId | null;
  clientEmail?: string | null;
  freelancerId: Types.ObjectId;
  freelancerName: string;
  planType: "Basic" | "Standard" | "Premium";
  price: number;

  /** NEW: snapshot of deliveryDays for the selected plan */
  deliveryDays: number;

  paymentStatus: "unpaid" | "paid";
  projectStatus: "pending" | "approved" | "cancelled" | "completed";

  /** NEW: set when freelancer accepts */
  acceptedAt?: Date | null;

  requirementsSnapshot: IRequirement[];
  requirementAnswers: IRequirementAnswer[];

  createdAt: Date;
  updatedAt: Date;
}

const RequirementSchema = new Schema<IRequirement>(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "textarea", "multiple_choice", "file", "instructions"],
      required: true,
    },
    question: { type: String, default: null },
    helperText: { type: String, default: null },
    required: { type: Boolean, default: false },
    options: { type: [String], default: [] },
    allowMultiple: { type: Boolean, default: false },
    accepts: { type: [String], default: [] },
    maxFiles: { type: Number, default: null },
    content: { type: String, default: null },
  },
  { _id: false }
);

const RequirementAnswerSchema = new Schema<IRequirementAnswer>(
  {
    id: { type: String, required: true },
    text: { type: String, default: null },
    options: { type: [String], default: [] },
    files: {
      type: [{ name: String, size: Number, url: { type: String, required: true } }],
      default: [],
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, default: null, index: true },

    clientId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    clientEmail: { type: String, default: null },

    freelancerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    freelancerName: { type: String, required: true },

    planType: { type: String, enum: ["Basic", "Standard", "Premium"], required: true },
    price: { type: Number, required: true, min: 0 },

    /** NEW */
    deliveryDays: { type: Number, required: true, min: 1, default: 1 },

    paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid", index: true },
    projectStatus: {
      type: String,
      enum: ["pending", "approved", "cancelled", "completed"],
      default: "pending",
      index: true,
    },

    /** NEW */
    acceptedAt: { type: Date, default: null },

    requirementsSnapshot: { type: [RequirementSchema], default: [] },
    requirementAnswers: { type: [RequirementAnswerSchema], default: [] },
  },
  { timestamps: true, versionKey: false }
);

OrderSchema.index({ clientId: 1, createdAt: -1 });
OrderSchema.index({ freelancerId: 1, createdAt: -1 });

OrderSchema.pre("save", function (next) {
  if (!this.isNew) return next();
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }
  next();
});

const OrderModel =
  (mongoose.models.Order as mongoose.Model<IOrder>) ||
  mongoose.model<IOrder>("Order", OrderSchema);

export default OrderModel;
