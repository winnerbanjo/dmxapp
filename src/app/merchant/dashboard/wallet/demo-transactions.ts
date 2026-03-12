export const DEMO_BALANCE = 450_000;

export const DEMO_TRANSACTIONS = [
  { id: "tx-1", label: "Wallet Top-up", amount: 100_000, date: "15 Feb 2026", reason: "Card top-up via Paystack", linkedShipment: null, referenceId: "DMXTXN-501001" },
  { id: "tx-2", label: "Shipment Payment", amount: -4_500, date: "14 Feb 2026", reason: "Wallet debit for shipment booking", linkedShipment: "DMX-1001", referenceId: "DMXTXN-501002" },
  { id: "tx-3", label: "Shipment Payment", amount: -2_500, date: "13 Feb 2026", reason: "Wallet debit for shipment booking", linkedShipment: "DMX-1004", referenceId: "DMXTXN-501003" },
  { id: "tx-4", label: "Wallet Top-up", amount: 50_000, date: "12 Feb 2026", reason: "Manual bank transfer settlement", linkedShipment: null, referenceId: "DMXTXN-501004" },
  { id: "tx-5", label: "Shipment Payment", amount: -12_000, date: "11 Feb 2026", reason: "Express interstate shipment charge", linkedShipment: "DMX-1007", referenceId: "DMXTXN-501005" },
  { id: "tx-6", label: "Shipment Payment", amount: -6_000, date: "10 Feb 2026", reason: "Shipment booking from merchant dashboard", linkedShipment: "DMX-1003", referenceId: "DMXTXN-501006" },
  { id: "tx-7", label: "Shipment Payment", amount: -3_000, date: "9 Feb 2026", reason: "Local delivery booking charge", linkedShipment: "DMX-1006", referenceId: "DMXTXN-501007" },
  { id: "tx-8", label: "Wallet Top-up", amount: 25_000, date: "5 Feb 2026", reason: "Quick fund from saved card", linkedShipment: null, referenceId: "DMXTXN-501008" },
];
