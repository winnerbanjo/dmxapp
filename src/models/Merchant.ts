import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMerchant extends Document {
  _id: mongoose.Types.ObjectId;
  businessName: string;
  email: string;
  password: string; // store hashed value
  isVerified: boolean;
  walletBalance: number;
  role: "MERCHANT";
  createdAt: Date;
  updatedAt: Date;
}

const MerchantSchema = new Schema<IMerchant>(
  {
    businessName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0 },
    role: { type: String, enum: ["MERCHANT"], default: "MERCHANT" },
  },
  { timestamps: true }
);

const Merchant: Model<IMerchant> =
  mongoose.models.Merchant ?? mongoose.model<IMerchant>("Merchant", MerchantSchema);

export default Merchant;
