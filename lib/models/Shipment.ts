import mongoose, { Document, Model, Schema } from "mongoose";

export const ShipmentStatusEnum = ["Pending", "In-Transit", "Delivered"] as const;
export type ShipmentStatus = (typeof ShipmentStatusEnum)[number];

export interface IReceiverDetails {
  name: string;
  phone: string;
  address: string;
}

/** Timeline step timestamps for Delivery Journey (public tracking) */
export interface ITimelineSteps {
  pickedUpAt?: Date;
  atSortingCenterAt?: Date;
  outForDeliveryAt?: Date;
  deliveredAt?: Date;
}

export interface IShipment extends Document {
  _id: mongoose.Types.ObjectId;
  merchantId: mongoose.Types.ObjectId;
  trackingId: string;
  receiverDetails: IReceiverDetails;
  packageWeight: number; // in kg
  /** @deprecated Use sellingPrice. Kept for backward compat; equals sellingPrice. */
  cost: number;
  /** What DMX pays carriers (cost price). */
  costPrice: number;
  /** What the Merchant/Customer pays (selling price). grossProfit = sellingPrice - costPrice */
  sellingPrice: number;
  status: ShipmentStatus;
  /** Optional timeline timestamps for each journey step */
  timeline?: ITimelineSteps;
  createdAt: Date;
  updatedAt: Date;
}

const ReceiverDetailsSchema = new Schema<IReceiverDetails>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
  },
  { _id: false }
);

const ShipmentSchema = new Schema<IShipment>(
  {
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
    },
    trackingId: { type: String, required: true, unique: true },
    receiverDetails: { type: ReceiverDetailsSchema, required: true },
    packageWeight: { type: Number, required: true },
    cost: { type: Number, required: true },
    costPrice: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ShipmentStatusEnum,
      default: "Pending",
    },
    timeline: {
      pickedUpAt: { type: Date },
      atSortingCenterAt: { type: Date },
      outForDeliveryAt: { type: Date },
      deliveredAt: { type: Date },
    },
  },
  { timestamps: true }
);

const Shipment: Model<IShipment> =
  mongoose.models.Shipment || mongoose.model<IShipment>("Shipment", ShipmentSchema);

export default Shipment;
