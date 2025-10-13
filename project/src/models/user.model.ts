// src/models/user.model.ts
import mongoose, { Schema, Document, Types } from "mongoose";

/* ------------ Subtypes ------------ */
export interface IRatePlan {
  type: "Basic" | "Standard" | "Premium";
  price: number;
  description: string;
  whatsIncluded: string[];
  deliveryDays: number;
  revisions: number;
}

export interface IPortfolioItem {
  title: string;
  description: string;
  imageUrl?: string | null;
  projectUrl?: string | null;
}

/* ------------ User ------------ */
export interface IUser extends Document {
  _id: Types.ObjectId;

  // Auth & Core
  userName: string;
  email: string;
  password: string; // hidden by default (select: false)
  role: "client" | "freelancer" | "admin";
  isVerified: boolean;
  verificationCode: string | null;           // hidden by default
  verificationCodeExpires: Date | null;      // hidden by default

  // Shared profile
  profilePicture?: string | null;
  bio?: string | null;
  location?: string | null;

  // Client-only
  companyName?: string | null;
  website?: string | null;
  about?: string | null;

  // Freelancer-only
  category?: string | null;          // indexed
  services?: string[];
  skills?: string[];
  portfolio?: IPortfolioItem[];
  ratePlans?: IRatePlan[];
  aboutThisGig?: string | null;
  whatIOffer?: string[];
  socialLinks?: { platform: string; url: string }[];
  languageProficiency?: string[];

  // Approval & moderation
  approvalStatus: "pending" | "approved" | "rejected"; // indexed
  rejectionReason?: string | null;
  reviewedBy?: Types.ObjectId | null; // admin user id
  reviewedAt?: Date | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    userName: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [2, "Username must be at least 2 characters"],
      maxlength: [50, "Username cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // 👈 hidden by default
    },
    role: {
      type: String,
      enum: ["client", "freelancer", "admin"],
      default: "client",
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      default: null,
      select: false, // 👈 hidden by default
    },
    verificationCodeExpires: {
      type: Date,
      default: null,
      select: false, // 👈 hidden by default
    },

    // Shared
    profilePicture: { type: String, default: null },
    bio: { type: String, default: null },
    location: { type: String, default: null },

    // Client
    companyName: { type: String, default: null },
    website: { type: String, default: null },
    about: { type: String, default: null },

    // Freelancer
    category: { type: String, default: null, index: true },
    services: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    portfolio: {
      type: [
        {
          title: { type: String, required: true },
          description: { type: String, required: true },
          imageUrl: { type: String, default: null },
          projectUrl: { type: String, default: null },
        },
      ],
      default: [],
    },
    ratePlans: {
      type: [
        {
          type: {
            type: String,
            enum: ["Basic", "Standard", "Premium"],
            required: true,
          },
          price: { type: Number, required: true, min: 0 },
          description: { type: String, required: true },
          whatsIncluded: { type: [String], required: true, default: [] },
          deliveryDays: { type: Number, required: true, min: 1 },
          revisions: { type: Number, required: true, min: 0 },
        },
      ],
      default: [],
    },
    aboutThisGig: { type: String, default: null },
    whatIOffer: { type: [String], default: [] },
    socialLinks: { type: [{ platform: String, url: String }], default: [] },
    languageProficiency: { type: [String], default: [] },

    // Approval & moderation
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    rejectionReason: { type: String, default: null },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

/* ---------- Virtuals ---------- */
// Optional: make `id` mirror `_id` as string
UserSchema.virtual("id").get(function (this: IUser) {
  return this._id.toHexString();
});

/* ---------- Serialization ---------- */
// No version key, keep virtuals. No need to delete sensitive fields because we used `select: false`.
UserSchema.set("toJSON", { virtuals: true, versionKey: false });
UserSchema.set("toObject", { virtuals: true, versionKey: false });

/* ---------- Indexes ---------- */
/**
 * Avoid duplicate index warnings:
 * - We already set `index: true` on field defs for `email`, `role`, `category`, `approvalStatus`.
 * - Keep a single text index for search below.
 */
UserSchema.index({
  userName: "text",
  email: "text",
  skills: "text",
  services: "text",
});

/* ---------- Export ---------- */
const UserModel =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default UserModel;

/* ---------- Notes ----------
- When you need the password (e.g., login), explicitly select it:
    const user = await UserModel.findOne({ email }).select("+password");
- Same if you ever need verification fields:
    .select("+verificationCode +verificationCodeExpires")
*/
