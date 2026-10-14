import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import type { ShipmentDocData } from "./shipment-document";

/**
 * Generates an official 4" x 6" (101.6mm x 152.4mm) thermal parcel shipping label.
 */
export async function generateShippingLabelPdf(data: ShipmentDocData): Promise<Buffer> {
  const doc = new jsPDF({
    format: [101.6, 152.4],
    unit: "mm",
    orientation: "portrait",
  });

  const width = 101.6;
  const height = 152.4;
  const margin = 5;

  // Outer border
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.6);
  doc.rect(margin, margin, width - margin * 2, height - margin * 2);

  let y = margin + 5;

  // 1. Header: DMX LOGISTICS & DHL PARTNER
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(94, 25, 20); // DMX Burgundy #5e1914
  doc.text("DMX LOGISTICS", margin + 3, y);

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text("EXPRESS WORLDWIDE", width - margin - 3, y, { align: "right" });

  y += 4;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("AIR CARRIAGE & GLOBAL FREIGHT", margin + 3, y);
  doc.text("PARTNER: DHL EXPRESS", width - margin - 3, y, { align: "right" });

  y += 3;
  doc.setLineWidth(0.4);
  doc.line(margin, y, width - margin, y);

  // 2. Shipper (FROM) Box
  y += 4;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.text("FROM (SHIPPER):", margin + 3, y);

  y += 3.5;
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(data.shipper.name, margin + 3, y);
  doc.setFont("helvetica", "normal");
  if (data.shipper.company) {
    y += 3;
    doc.text(data.shipper.company, margin + 3, y);
  }
  y += 3;
  doc.text(`${data.shipper.address}, ${data.shipper.city}, ${data.shipper.country}`, margin + 3, y);
  y += 3;
  doc.text(`TEL: ${data.shipper.phone}`, margin + 3, y);

  y += 3;
  doc.setLineWidth(0.4);
  doc.line(margin, y, width - margin, y);

  // 3. Consignee (SHIP TO) Box - Prominent
  y += 4;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.text("SHIP TO (CONSIGNEE):", margin + 3, y);

  y += 4;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(data.receiver.name.toUpperCase(), margin + 3, y);

  y += 4;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  if (data.receiver.company) {
    doc.text(data.receiver.company, margin + 3, y);
    y += 3.5;
  }
  doc.text(data.receiver.address, margin + 3, y);
  y += 3.5;
  doc.text(`${data.receiver.city} ${data.receiver.postalCode || ""}`, margin + 3, y);

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(data.receiver.country.toUpperCase(), margin + 3, y);

  y += 4;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`TEL: ${data.receiver.phone}`, margin + 3, y);

  y += 3;
  doc.line(margin, y, width - margin, y);

  // 4. Barcode & QR Code Section
  const qrSize = 24;
  const qrX = width - margin - qrSize - 3;
  const qrY = y + 3;

  try {
    const qrDataUrl = await QRCode.toDataURL(data.trackUrl, { width: 140, margin: 0 });
    doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
  } catch (e) {
    // QR fallback
  }

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("WAYBILL / AWB NUMBER:", margin + 3, y);

  y += 5;
  doc.setFontSize(14);
  doc.text(data.trackingNumber, margin + 3, y);

  if (data.dhlTrackingNumber) {
    y += 4;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`DHL AWB: ${data.dhlTrackingNumber}`, margin + 3, y);
  }

  y += 5;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(90, 90, 90);
  doc.text("Scan QR to track live on DMX Network", margin + 3, y);

  y = qrY + qrSize + 3;
  doc.setLineWidth(0.4);
  doc.line(margin, y, width - margin, y);

  // 5. Weight, Dimensions & Date Grid
  y += 4;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.text("WEIGHT", margin + 3, y);
  doc.text("CHG WEIGHT", margin + 28, y);
  doc.text("PCS", margin + 55, y);
  doc.text("DATE", width - margin - 3, y, { align: "right" });

  y += 4;
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(`${data.actualWeight.toFixed(2)} kg`, margin + 3, y);
  doc.text(`${data.chargeableWeight.toFixed(2)} kg`, margin + 28, y);
  doc.text("1 / 1", margin + 55, y);
  const formattedDate = new Date(data.dateAdded).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  doc.text(formattedDate, width - margin - 3, y, { align: "right" });

  y += 3;
  doc.line(margin, y, width - margin, y);

  // 6. Customs & Declared Goods Summary
  y += 4;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.text("CUSTOMS DECLARATION & COMMODITY:", margin + 3, y);

  y += 3.5;
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  const firstItem = data.items[0] || { name: "Goods", hsCode: "6204.42", value: 50000, origin: "Nigeria" };
  doc.text(firstItem.name.substring(0, 42), margin + 3, y);

  y += 3.5;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text(`HS TARIFF: ${firstItem.hsCode || "6204.42"}  |  ORIGIN: ${firstItem.origin || "Nigeria"}`, margin + 3, y);

  y += 3.5;
  doc.text(`DECLARED VALUE: NGN ${firstItem.value.toLocaleString()}  |  PACKAGING: ${data.packaging}`, margin + 3, y);

  y += 3;
  doc.line(margin, y, width - margin, y);

  // 7. Footer
  y += 3.5;
  doc.setFontSize(6);
  doc.setTextColor(110, 110, 110);
  doc.text("Security Inspected & Cleared for Air Carriage. Standard DMX Carriage Conditions Apply.", margin + 3, y);

  return Buffer.from(doc.output("arraybuffer"));
}

/**
 * Generates an official multi-section International Air Waybill / Consignment Note in A4 format.
 */
export async function generateAirWaybillPdf(data: ShipmentDocData): Promise<Buffer> {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const width = 210;
  const height = 297;
  const margin = 14;

  let y = margin + 5;

  // Header Bar
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(94, 25, 20); // DMX Burgundy
  doc.text("DMX LOGISTICS", margin, y);

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("INTERNATIONAL AIR WAYBILL", width - margin, y - 2, { align: "right" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("CONSIGNMENT NOTE / DISPATCH RECEIPT", width - margin, y + 3, { align: "right" });

  y += 8;
  doc.setLineWidth(0.8);
  doc.setDrawColor(94, 25, 20);
  doc.line(margin, y, width - margin, y);

  // AWB & QR Header Box
  y += 4;
  const awbBoxHeight = 26;
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(250, 250, 250);
  doc.rect(margin, y, width - margin * 2, awbBoxHeight, "FD");

  // QR Code on right
  try {
    const qrDataUrl = await QRCode.toDataURL(data.trackUrl, { width: 140, margin: 0 });
    doc.addImage(qrDataUrl, "PNG", width - margin - 24, y + 2, 22, 22);
  } catch (e) {
    // Skip QR
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("AIR WAYBILL NO. (TRACKING ID)", margin + 4, y + 6);

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(data.trackingNumber, margin + 4, y + 14);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(`Booking Date: ${new Date(data.dateAdded).toLocaleString("en-GB")}`, margin + 4, y + 21);
  if (data.dhlTrackingNumber) {
    doc.text(`Carrier Partner: ${data.carrier} (AWB: ${data.dhlTrackingNumber})`, margin + 70, y + 21);
  } else {
    doc.text(`Carrier Partner: ${data.carrier} (${data.carrierService})`, margin + 70, y + 21);
  }

  y += awbBoxHeight + 6;

  // 2-Column Parties Grid (Shipper & Consignee)
  const colWidth = (width - margin * 2 - 6) / 2;
  const partyBoxHeight = 44;

  // Shipper Box
  doc.setDrawColor(210, 210, 210);
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, colWidth, partyBoxHeight);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(94, 25, 20);
  doc.text("1. SHIPPER / CONSIGNOR (FROM)", margin + 4, y + 6);

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(data.shipper.name, margin + 4, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(data.shipper.company || "DMX Account Shipper", margin + 4, y + 17);
  doc.text(data.shipper.address, margin + 4, y + 22);
  doc.text(`${data.shipper.city}, ${data.shipper.state}, ${data.shipper.country}`, margin + 4, y + 27);
  doc.text(`Tel: ${data.shipper.phone}`, margin + 4, y + 33);
  doc.text(`Email: ${data.shipper.email}`, margin + 4, y + 38);

  // Consignee Box
  const col2X = margin + colWidth + 6;
  doc.rect(col2X, y, colWidth, partyBoxHeight);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(94, 25, 20);
  doc.text("2. CONSIGNEE / RECEIVER (TO)", col2X + 4, y + 6);

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(data.receiver.name, col2X + 4, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  if (data.receiver.company) {
    doc.text(data.receiver.company, col2X + 4, y + 17);
  }
  doc.text(data.receiver.address, col2X + 4, y + 22);
  doc.text(`${data.receiver.city}, ${data.receiver.postalCode || ""}`, col2X + 4, y + 27);
  doc.setFont("helvetica", "bold");
  doc.text(data.receiver.country.toUpperCase(), col2X + 4, y + 33);
  doc.setFont("helvetica", "normal");
  doc.text(`Tel: ${data.receiver.phone} | Email: ${data.receiver.email}`, col2X + 4, y + 38);

  y += partyBoxHeight + 6;

  // Shipment Specifications Grid
  doc.setDrawColor(210, 210, 210);
  doc.setFillColor(250, 250, 250);
  const specHeight = 18;
  doc.rect(margin, y, width - margin * 2, specHeight, "FD");

  const specCols = [
    { label: "PIECES", val: "1 Box" },
    { label: "ACTUAL WT", val: `${data.actualWeight.toFixed(2)} kg` },
    { label: "VOLUMETRIC WT", val: `${data.volumetricWeight.toFixed(2)} kg` },
    { label: "CHARGEABLE WT", val: `${data.chargeableWeight.toFixed(2)} kg` },
    { label: "DIMENSIONS", val: `${data.dimensions.length}x${data.dimensions.width}x${data.dimensions.height} cm` },
    { label: "PAYMENT", val: `PAID (NGN ${data.cost.total.toLocaleString()})` },
  ];

  const specColWidth = (width - margin * 2) / specCols.length;
  specCols.forEach((col, idx) => {
    const cx = margin + idx * specColWidth + 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(110, 110, 110);
    doc.text(col.label, cx, y + 5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(0, 0, 0);
    doc.text(col.val, cx, y + 12);
  });

  y += specHeight + 6;

  // Itemized Cargo Manifest Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(94, 25, 20);
  doc.text("3. CUSTOMS CARGO MANIFEST & COMMODITY DECLARATION", margin, y);

  y += 4;
  doc.setFillColor(94, 25, 20);
  doc.rect(margin, y, width - margin * 2, 6, "F");

  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("ITEM / COMMODITY DESCRIPTION", margin + 3, y + 4.2);
  doc.text("HS TARIFF CODE", margin + 85, y + 4.2);
  doc.text("QTY", margin + 120, y + 4.2);
  doc.text("WEIGHT", margin + 135, y + 4.2);
  doc.text("ORIGIN", margin + 155, y + 4.2);
  doc.text("DECLARED VALUE", width - margin - 3, y + 4.2, { align: "right" });

  y += 6;

  data.items.forEach((item, idx) => {
    const rowY = y + idx * 7;
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, rowY + 7, width - margin, rowY + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(`${idx + 1}. ${item.name}`, margin + 3, rowY + 5);

    doc.setFont("helvetica", "bold");
    doc.text(item.hsCode || "6204.42", margin + 85, rowY + 5);

    doc.setFont("helvetica", "normal");
    doc.text(`${item.quantity} pcs`, margin + 120, rowY + 5);
    doc.text(`${item.weight} kg`, margin + 135, rowY + 5);
    doc.text(item.origin || "Nigeria", margin + 155, rowY + 5);
    doc.text(`NGN ${item.value.toLocaleString()}`, width - margin - 3, rowY + 5, { align: "right" });
  });

  y += Math.max(data.items.length * 7, 14) + 6;

  // Billing and Signatures Box
  const bottomBoxHeight = 44;
  doc.setDrawColor(210, 210, 210);
  doc.rect(margin, y, width - margin * 2, bottomBoxHeight);

  // Left side: Declarations
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(94, 25, 20);
  doc.text("SHIPPER'S DECLARATION & CONDITIONS OF CARRIAGE", margin + 4, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(80, 80, 80);
  const declarationText =
    "I/We certify that the particulars on the face hereof are correct and that the contents of this consignment are properly classified, described, packaged, marked and labelled, and are in proper condition for carriage by air according to the applicable International Civil Aviation regulations. DMX liability is limited in accordance with the Warsaw/Montreal conventions.";
  doc.text(declarationText, margin + 4, y + 11, { maxWidth: 110 });

  // Signature lines
  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);
  doc.text("Shipper Signature: _______________________", margin + 4, y + 36);
  doc.text("Agent Signature: _______________________", margin + 65, y + 36);

  // Right side: Charges breakdown
  const chargesX = width - margin - 60;
  doc.setDrawColor(230, 230, 230);
  doc.line(chargesX - 5, y, chargesX - 5, y + bottomBoxHeight);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text("CHARGES SUMMARY", chargesX, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("Freight / Shipping:", chargesX, y + 13);
  doc.text(`NGN ${data.cost.shipping.toLocaleString()}`, width - margin - 4, y + 13, { align: "right" });

  doc.text("Insurance & Handling:", chargesX, y + 19);
  doc.text(`NGN ${data.cost.insurance.toLocaleString()}`, width - margin - 4, y + 19, { align: "right" });

  doc.text("Customs Processing:", chargesX, y + 25);
  doc.text(`NGN ${data.cost.customs.toLocaleString()}`, width - margin - 4, y + 25, { align: "right" });

  doc.setLineWidth(0.4);
  doc.line(chargesX, y + 28, width - margin - 4, y + 28);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("TOTAL CHARGE:", chargesX, y + 35);
  doc.text(`NGN ${data.cost.total.toLocaleString()}`, width - margin - 4, y + 35, { align: "right" });

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(130, 130, 130);
  doc.text("Generated by DMX Logistics Digital Console. Official International Air Waybill Document.", margin, height - 8);
  doc.text(`Page 1 of 1 · Verified Track URL: ${data.trackUrl}`, width - margin, height - 8, { align: "right" });

  return Buffer.from(doc.output("arraybuffer"));
}
