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

  /** Snapshot of selected plan's delivery window (in days) */
  deliveryDays: number;

  paymentStatus: "unpaid" | "paid";
  projectStatus: "pending" | "approved" | "cancelled" | "completed";

  /** When the freelancer accepts the order (used for timer) */
  acceptedAt?: Date | null;

  /** Snapshot at purchase */
  requirementsSnapshot: IRequirement[];

  /** Client answers */
  requirementAnswers: IRequirementAnswer[];

  /** Virtuals */
  deadlineAt?: Date | null; // computed from acceptedAt + deliveryDays
  isOverdue?: boolean; // computed

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
      type: [
        {
          name: { type: String, required: true },
          size: { type: Number, default: undefined },
          url: { type: String, required: true },
        },
      ],
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

    deliveryDays: { type: Number, required: true, min: 1, default: 1 },

    paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid", index: true },
    projectStatus: {
      type: String,
      enum: ["pending", "approved", "cancelled", "completed"],
      default: "pending",
      index: true,
    },

    acceptedAt: { type: Date, default: null },

    requirementsSnapshot: { type: [RequirementSchema], default: [] },
    requirementAnswers: { type: [RequirementAnswerSchema], default: [] },
  },
  { timestamps: true, versionKey: false }
);

/* ---------- Helpful indexes ---------- */
OrderSchema.index({ clientId: 1, createdAt: -1 });
OrderSchema.index({ freelancerId: 1, createdAt: -1 });
OrderSchema.index({ projectStatus: 1, acceptedAt: -1 });

/* ---------- Short human-friendly order number on create ---------- */
OrderSchema.pre("save", function (next) {
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = `ORD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }
  next();
});

/* ---------- Auto-set acceptedAt when moving to approved ---------- */
OrderSchema.pre("save", function (next) {
  // If transitioning into approved and not yet set, stamp acceptedAt
  if (this.isModified("projectStatus") && this.projectStatus === "approved" && !this.acceptedAt) {
    this.acceptedAt = new Date();
  }
  next();
});

/* ---------- Virtuals for deadline / overdue ---------- */
OrderSchema.virtual("deadlineAt").get(function (this: IOrder) {
  if (!this.acceptedAt || !this.deliveryDays) return null;
  const ms = this.deliveryDays * 24 * 60 * 60 * 1000;
  return new Date(this.acceptedAt.getTime() + ms);
});

OrderSchema.virtual("isOverdue").get(function (this: IOrder) {
  const deadline = (this as any).deadlineAt as Date | null;
  if (!deadline) return false;
  if (this.projectStatus === "completed" || this.projectStatus === "cancelled") return false;
  return Date.now() > deadline.getTime();
});

/* ---------- Serialize virtuals ---------- */
OrderSchema.set("toJSON", { virtuals: true });
OrderSchema.set("toObject", { virtuals: true });

const OrderModel =
  (mongoose.models.Order as mongoose.Model<IOrder>) ||
  mongoose.model<IOrder>("Order", OrderSchema);

export default OrderModel;
