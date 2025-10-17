import mongoose, { Schema, Types, Document } from "mongoose";

/** --- Types that mirror your freelancer requirements schema --- */
export type RequirementType =
  | "text"
  | "textarea"
  | "multiple_choice"
  | "file"
  | "instructions";

export interface IRequirement {
  id: string; // stable client-side id
  type: RequirementType;
  question?: string | null;       // for text/textarea/multiple_choice
  helperText?: string | null;
  required?: boolean;
  options?: string[];             // for multiple_choice
  allowMultiple?: boolean;        // for multiple_choice
  accepts?: string[];             // for file
  maxFiles?: number | null;       // for file
  content?: string | null;        // for instructions only (no response)
}

/** --- Client answers captured after payment --- */
export interface IRequirementAnswer {
  id: string;              // matches IRequirement.id
  text?: string | null;    // for text/textarea
  options?: string[];      // for multiple_choice
  // IMPORTANT: include uploadthing URL so the freelancer can access files
  files?: { name: string; size?: number; url: string }[];
}

export interface IOrder extends Document {
  _id: Types.ObjectId;

  orderNumber?: string | null;    // short human-friendly id

  clientId?: Types.ObjectId | null;         // optional (if you later add auth)
  clientEmail?: string | null;              // optional
  freelancerId: Types.ObjectId;
  freelancerName: string;
  planType: "Basic" | "Standard" | "Premium";
  price: number; // price snapshot at purchase

  paymentStatus: "unpaid" | "paid";
  // added "completed" now so you won't need a migration later
  projectStatus: "pending" | "approved" | "cancelled" | "completed";

  // snapshot the requirements at time of purchase so edits later don't affect past orders
  requirementsSnapshot: IRequirement[];

  // answers submitted by the client (after payment)
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
      // include URL for uploadthing
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

    paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid", index: true },
    projectStatus: {
      type: String,
      enum: ["pending", "approved", "cancelled", "completed"],
      default: "pending",
      index: true,
    },

    requirementsSnapshot: { type: [RequirementSchema], default: [] },
    requirementAnswers: { type: [RequirementAnswerSchema], default: [] },
  },
  { timestamps: true, versionKey: false }
);

// Helpful compound indexes for dashboards/lists
OrderSchema.index({ clientId: 1, createdAt: -1 });
OrderSchema.index({ freelancerId: 1, createdAt: -1 });

/** Optional: generate a short orderNumber once on create */
OrderSchema.pre("save", function (next) {
  if (!this.isNew) return next();
  if (!this.orderNumber) {
    // very simple short id; replace with nanoid/uuid if you prefer
    this.orderNumber = `ORD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }
  next();
});

const OrderModel =
  (mongoose.models.Order as mongoose.Model<IOrder>) ||
  mongoose.model<IOrder>("Order", OrderSchema);

export default OrderModel;
