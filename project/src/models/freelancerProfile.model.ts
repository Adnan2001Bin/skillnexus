// src/models/freelancerProfile.model.ts
import mongoose, { Schema, Document } from "mongoose";

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

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface IFreelancerProfile extends Document {
  user: mongoose.Types.ObjectId;
  location?: string | null;
  profilePicture?: string | null;
  bio?: string | null;
  category?: string | null;
  services?: string[];
  skills: string[];
  portfolio: IPortfolioItem[];
  ratePlans: IRatePlan[];
  aboutThisGig?: string | null;
  whatIOffer: string[];
  socialLinks: { platform: string; url: string }[];
  languageProficiency: string[];

  // moderation
  approvalStatus: ApprovalStatus;
  rejectionReason?: string | null;
  reviewedBy?: mongoose.Types.ObjectId | null;
  reviewedAt?: Date | null;
}

const FreelancerProfileSchema = new Schema<IFreelancerProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    location: { type: String, default: null },
    profilePicture: { type: String, default: null },
    bio: { type: String, default: null },
    category: { type: String, default: null },
    services: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    portfolio: {
      type: [
        {
          title: String,
          description: String,
          imageUrl: { type: String, default: null },
          projectUrl: { type: String, default: null },
        },
      ],
      default: [],
    },
    ratePlans: {
      type: [
        {
          type: { type: String, enum: ["Basic", "Standard", "Premium"], required: true },
          price: { type: Number, required: true, min: 0 },
          description: { type: String, required: true },
          whatsIncluded: { type: [String], required: true },
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

    // moderation
    approvalStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    rejectionReason: { type: String, default: null },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default (mongoose.models.FreelancerProfile as mongoose.Model<IFreelancerProfile>) ||
  mongoose.model<IFreelancerProfile>("FreelancerProfile", FreelancerProfileSchema);
