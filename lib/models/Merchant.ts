import mongoose, { Document, Model, Schema } from "mongoose";

export type KycStatus = "Pending Verification" | "Approved" | "Rejected";

export interface IPersonalKyc {
  fullName: string;
  dateOfBirth: string;
  idType: "NIN" | "Passport" | "BVN";
  idDocumentUrl?: string;
}

export interface IBusinessKyc {
  companyName: string;
  rcNumber: string;
  businessAddress: string;
  cacDocumentUrl?: string;
}

export interface IMerchant extends Document {
  _id: mongoose.Types.ObjectId;
  businessName: string;
  email: string;
  password: string;
  address: string;
  isVerified: boolean;
  kycStatus: KycStatus;
  personalKyc?: IPersonalKyc;
  businessKyc?: IBusinessKyc;
  walletBalance: number;
  apiKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PersonalKycSchema = new Schema<IPersonalKyc>(
  {
    fullName: { type: String, default: "" },
    dateOfBirth: { type: String, default: "" },
    idType: { type: String, enum: ["NIN", "Passport", "BVN"], default: "NIN" },
    idDocumentUrl: { type: String },
  },
  { _id: false }
);

const BusinessKycSchema = new Schema<IBusinessKyc>(
  {
    companyName: { type: String, default: "" },
    rcNumber: { type: String, default: "" },
    businessAddress: { type: String, default: "" },
    cacDocumentUrl: { type: String },
  },
  { _id: false }
);

const MerchantSchema = new Schema<IMerchant>(
  {
    businessName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    kycStatus: { type: String, enum: ["Pending Verification", "Approved", "Rejected"], default: "Pending Verification" },
    personalKyc: { type: PersonalKycSchema },
    businessKyc: { type: BusinessKycSchema },
    walletBalance: { type: Number, default: 0 },
    apiKey: { type: String },
  },
  { timestamps: true }
);

const Merchant: Model<IMerchant> =
  mongoose.models.Merchant || mongoose.model<IMerchant>("Merchant", MerchantSchema);

export default Merchant;
