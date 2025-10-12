import mongoose, { Schema, Document } from "mongoose";

export interface IClientProfile extends Document {
  user: mongoose.Types.ObjectId;
  location?: string | null;
  profilePicture?: string | null;
  companyName?: string | null;
  website?: string | null;
  about?: string | null;
}

const ClientProfileSchema = new Schema<IClientProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    location: { type: String, default: null },
    profilePicture: { type: String, default: null },
    companyName: { type: String, default: null },
    website: { type: String, default: null },
    about: { type: String, default: null },
  },
  { timestamps: true }
);

export default (mongoose.models.ClientProfile as mongoose.Model<IClientProfile>) ||
  mongoose.model<IClientProfile>("ClientProfile", ClientProfileSchema);
