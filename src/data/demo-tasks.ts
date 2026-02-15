import type { ServiceType } from "@/data/booking-constants";

/** Push-dispatch tasks: Admin creates (IG/WhatsApp orders), Hub staff sees as Pending Pickups / Deliveries. */

export type TaskStatus = "Unassigned" | "Assigned" | "In Progress" | "Completed";
export type TaskSource = "IG" | "WhatsApp";
export type HubSlug = "Lagos" | "Abuja" | "PH";

/** Payload saved to sessionStorage when hub staff clicks Accept Task; used to auto-fill /hub/booking. */
export type HubBookingFromTask = {
  customerName: string;
  phone: string;
  specialInstructions?: string;
  item?: string;
  pickupAddress: string;
  deliveryAddress?: string;
  orderRef: string;
  source: string;
  /** Service type so hub booking opens the correct form. */
  serviceType?: ServiceType;
};

export const BOOKING_FROM_TASK_KEY = "dmx-hub-booking-from-task";

export type DemoTask = {
  id: string;
  source: TaskSource;
  orderRef: string;
  customerName: string;
  phone: string;
  item: string;
  pickupAddress: string;
  deliveryAddress?: string;
  /** Conversational details or specific delivery requirements for hub staff. */
  specialInstructions?: string;
  assignedHub: HubSlug;
  status: TaskStatus;
  createdAt: string;
  /** Service type for smart task integration — opens correct booking form. */
  serviceType?: ServiceType;
};

/** Global task board: Admin sees all; Hub sees only tasks for their hub. */
export const DEMO_TASKS: DemoTask[] = [
  {
    id: "t1",
    source: "IG",
    orderRef: "#442",
    customerName: "Amara Okoli",
    phone: "+234 801 111 2233",
    item: "Luxury Candle Set",
    pickupAddress: "Lekki Phase 1, Lagos",
    assignedHub: "Lagos",
    status: "Assigned",
    createdAt: "15 Feb 2026",
    specialInstructions: "Call before arriving, gate code is 1234. Handle with extreme care.",
    serviceType: "local",
  },
  {
    id: "t2",
    source: "WhatsApp",
    orderRef: "#12",
    customerName: "Ibrahim Garba",
    phone: "+234 802 222 3344",
    item: "Document",
    pickupAddress: "Victoria Island, Lagos",
    deliveryAddress: "Gwarinpa, Abuja",
    assignedHub: "Abuja",
    status: "In Progress",
    createdAt: "15 Feb 2026",
    specialInstructions: "Recipient needs this signed and scanned back.",
    serviceType: "nationwide",
  },
  {
    id: "t3",
    source: "IG",
    orderRef: "#88",
    customerName: "Chioma Eze",
    phone: "+234 803 333 4455",
    item: "Custom cake",
    pickupAddress: "Adeniran Ogunsanya, Surulere",
    deliveryAddress: "Ikeja GRA",
    assignedHub: "Lagos",
    status: "Completed",
    createdAt: "14 Feb 2026",
    serviceType: "local",
  },
  {
    id: "t4",
    source: "WhatsApp",
    orderRef: "#156",
    customerName: "Tunde Adeyemi",
    phone: "+234 804 444 5566",
    item: "Electronics (phone + charger)",
    pickupAddress: "Computer Village, Ikeja",
    assignedHub: "Lagos",
    status: "Unassigned",
    createdAt: "15 Feb 2026",
    serviceType: "nationwide",
  },
  {
    id: "t5",
    source: "IG",
    orderRef: "#201",
    customerName: "Ngozi Nwosu",
    phone: "+234 805 555 6677",
    item: "Fashion parcel",
    pickupAddress: "Wuse 2, Abuja",
    deliveryAddress: "Maitama, Abuja",
    assignedHub: "Abuja",
    status: "In Progress",
    createdAt: "15 Feb 2026",
    serviceType: "local",
  },
  {
    id: "t6",
    source: "WhatsApp",
    orderRef: "#77",
    customerName: "Emeka Okafor",
    phone: "+234 806 666 7788",
    item: "Documents",
    pickupAddress: "Rumuola, Port Harcourt",
    assignedHub: "PH",
    status: "Assigned",
    createdAt: "14 Feb 2026",
    serviceType: "international",
  },
  {
    id: "t7",
    source: "IG",
    orderRef: "#303",
    customerName: "Funke Adebisi",
    phone: "+234 807 777 8899",
    item: "Skincare bundle",
    pickupAddress: "Lekki Phase 1, Lagos",
    assignedHub: "Lagos",
    status: "Assigned",
    createdAt: "15 Feb 2026",
    serviceType: "local",
  },
  {
    id: "t8",
    source: "WhatsApp",
    orderRef: "#12",
    customerName: "Ibrahim Garba",
    phone: "+234 802 222 3344",
    item: "Document",
    pickupAddress: "Victoria Island, Lagos",
    deliveryAddress: "Gwarinpa, Abuja",
    assignedHub: "Lagos",
    status: "In Progress",
    createdAt: "15 Feb 2026",
    specialInstructions: "Recipient needs this signed and scanned back.",
    serviceType: "nationwide",
  },
];

export const HUB_OPTIONS: { value: HubSlug; label: string }[] = [
  { value: "Lagos", label: "Lagos" },
  { value: "Abuja", label: "Abuja" },
  { value: "PH", label: "Port Harcourt" },
];
