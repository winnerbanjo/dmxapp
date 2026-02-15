import mongoose, { Document, Model, Schema } from "mongoose";

export const ShipmentStatusEnum = ["PENDING", "IN_TRANSIT", "DELIVERED"] as const;
export type ShipmentStatus = (typeof ShipmentStatusEnum)[number];

export interface IShipment extends Document {
  _id: mongoose.Types.ObjectId;
  trackingId: string;
  merchantId: mongoose.Types.ObjectId;
  pickupAddress: string;
  receiverAddress: string;
  weight: number;
  status: ShipmentStatus;
  cost: number;
  createdAt: Date;
  updatedAt: Date;
}

const ShipmentSchema = new Schema<IShipment>(
  {
    trackingId: { type: String, required: true, unique: true },
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
    },
    pickupAddress: { type: String, required: true },
    receiverAddress: { type: String, required: true },
    weight: { type: Number, required: true },
    status: {
      type: String,
      enum: ShipmentStatusEnum,
      default: "PENDING",
    },
    cost: { type: Number, required: true },
  },
  { timestamps: true }
);

const Shipment: Model<IShipment> =
  mongoose.models.Shipment ?? mongoose.model<IShipment>("Shipment", ShipmentSchema);

export default Shipment;
