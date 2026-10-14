import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import type { ShipmentDocData } from "./shipment-document";
import { formatDhlLabelData } from "./dhl-label-helper";

const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
];

function drawCode128Pdf(doc: jsPDF, text: string, x: number, y: number, targetWidth: number, height: number) {
  let checksum = 104;
  const indices: number[] = [104];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) - 32;
    if (code >= 0 && code <= 95) {
      indices.push(code);
      checksum += code * (i + 1);
    }
  }
  indices.push(checksum % 103);
  indices.push(106);

  let totalUnits = 0;
  for (const idx of indices) {
    const pattern = CODE128_PATTERNS[idx];
    if (!pattern) continue;
    for (let p = 0; p < pattern.length; p++) {
      totalUnits += parseInt(pattern[p], 10);
    }
  }

  const moduleWidth = targetWidth / totalUnits;
  let currentX = x;
  doc.setFillColor(0, 0, 0);

  for (const idx of indices) {
    const pattern = CODE128_PATTERNS[idx];
    if (!pattern) continue;
    for (let p = 0; p < pattern.length; p++) {
      const w = parseInt(pattern[p], 10) * moduleWidth;
      if (p % 2 === 0) {
        doc.rect(currentX, y, w, height, "F");
      }
      currentX += w;
    }
  }
}

/**
 * Generates an authentic DHL Express 4" x 6" (101.6mm x 152.4mm) thermal parcel shipping label.
 */
export async function generateShippingLabelPdf(data: ShipmentDocData): Promise<Buffer> {
  const dhl = formatDhlLabelData(data);
  const doc = new jsPDF({
    format: [101.6, 152.4],
    unit: "mm",
    orientation: "portrait",
  });

  const width = 101.6;
  const margin = 4;
  const contentWidth = width - margin * 2;
  let y = margin + 3;

  // 1. Header: EXPRESS WORLDWIDE | WPX | DHL
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("EXPRESS WORLDWIDE", margin, y);

  y += 2.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.text(`${dhl.dateStr} MyDHL API 1.0 / *GLS certified label*`, margin, y);

  // WPX Solid Box
  const wpxWidth = 14;
  const wpxHeight = 7;
  const wpxX = width - margin - 32;
  doc.setFillColor(0, 0, 0);
  doc.rect(wpxX, margin + 0.5, wpxWidth, wpxHeight, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("WPX", wpxX + 2.5, margin + 5.5);

  // DHL Logo Mark (Italic DHL with Speed Stripes)
  const dhlX = width - margin - 16;
  doc.setFillColor(0, 0, 0);
  // Left stripes
  doc.rect(dhlX - 5.5, margin + 2.5, 2.5, 0.4, "F");
  doc.rect(dhlX - 4.5, margin + 3.5, 3.5, 0.4, "F");
  doc.rect(dhlX - 3.5, margin + 4.5, 4.5, 0.5, "F");
  // Text DHL
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(14);
  doc.text("DHL", dhlX - 2.5, margin + 6);
  // Right stripes
  doc.rect(dhlX + 7.5, margin + 2.5, 4.5, 0.5, "F");
  doc.rect(dhlX + 7.5, margin + 3.5, 3.5, 0.4, "F");
  doc.rect(dhlX + 7.5, margin + 4.5, 2.5, 0.4, "F");

  // Divider line
  y = margin + 8.5;
  doc.setLineWidth(0.4);
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, y, width - margin, y);

  // 2. Shipper (From) & Origin Airport Code
  y += 3;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(0, 0, 0);
  doc.text("From :", margin, y);

  doc.setFont("helvetica", "normal");
  doc.text(dhl.shipper.name, margin + 9, y);
  y += 2.8;
  doc.text(dhl.shipper.company, margin + 9, y);
  y += 2.8;
  doc.text(dhl.shipper.address, margin + 9, y);
  y += 2.8;
  doc.text(dhl.shipper.cityState, margin + 9, y);
  y += 2.8;
  doc.text(dhl.shipper.country, margin + 9, y);

  // Origin Airport on right
  const originX = width - margin - 14;
  doc.setFontSize(6);
  doc.text("Origin:", originX, y - 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(dhl.originAirport, originX, y - 2);

  // Divider line
  y += 2.5;
  doc.line(margin, y, width - margin, y);

  // 3. Corner-Bracketed Recipient (To) Section
  y += 2;
  const toBoxTopY = y;
  const bracketSize = 3.5;

  // Top-left bracket
  doc.setLineWidth(0.6);
  doc.line(margin, toBoxTopY + bracketSize, margin, toBoxTopY);
  doc.line(margin, toBoxTopY, margin + bracketSize, toBoxTopY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("To :", margin + bracketSize + 1, toBoxTopY + 2.5);

  // Top-right bracket
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text("Contact:", width - margin - bracketSize - 11, toBoxTopY + 2.5);
  doc.line(width - margin - bracketSize, toBoxTopY, width - margin, toBoxTopY);
  doc.line(width - margin, toBoxTopY, width - margin, toBoxTopY + bracketSize);

  // Recipient details
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(dhl.receiver.name, margin + 8, y);
  y += 3.2;
  doc.text(dhl.receiver.company, margin + 8, y);
  y += 3.2;
  doc.text(dhl.receiver.address, margin + 8, y);
  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text(dhl.receiver.cityStatePostal, margin + 8, y);
  y += 4;
  doc.setFontSize(9.5);
  doc.text(dhl.receiver.country, margin + 8, y);

  // Bottom brackets
  const toBoxBottomY = y + 2;
  doc.setLineWidth(0.6);
  doc.line(margin, toBoxBottomY - bracketSize, margin, toBoxBottomY);
  doc.line(margin, toBoxBottomY, margin + bracketSize, toBoxBottomY);
  doc.line(width - margin - bracketSize, toBoxBottomY, width - margin, toBoxBottomY);
  doc.line(width - margin, toBoxBottomY - bracketSize, width - margin, toBoxBottomY);

  // Divider line
  y = toBoxBottomY + 2;
  doc.setLineWidth(0.4);
  doc.line(margin, y, width - margin, y);

  // 4. Routing Code Row
  y += 4.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(dhl.routingCode, margin, y);
  doc.rect(width - margin - 2, y - 2.5, 1.8, 1.8, "F");

  // Divider line
  y += 2.5;
  doc.line(margin, y, width - margin, y);

  // 5. Service Box (C-ADI) & Day/Time Columns
  const serviceBoxY = y;
  const serviceBoxHeight = 5.5;
  doc.setFillColor(0, 0, 0);
  doc.rect(margin, serviceBoxY, 18, serviceBoxHeight, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(dhl.serviceCode, margin + 2.5, serviceBoxY + 4);

  // Day & Time columns
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.line(width - margin - 24, serviceBoxY, width - margin - 24, serviceBoxY + serviceBoxHeight);
  doc.text("Day", width - margin - 20, serviceBoxY + 2.5);
  doc.line(width - margin - 12, serviceBoxY, width - margin - 12, serviceBoxY + serviceBoxHeight);
  doc.text("Time", width - margin - 8, serviceBoxY + 2.5);

  y += serviceBoxHeight;
  doc.line(margin, y, width - margin, y);

  // 6. Ref No, Content & Weight Summary
  y += 3;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("Ref No:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(dhl.refNo, margin + 11, y);

  y += 3;
  doc.setFont("helvetica", "bold");
  doc.text("Content :", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(dhl.content.substring(0, 32), margin + 12, y);

  // Weight & Piece on right
  const weightX = width - margin - 32;
  const pieceX = width - margin - 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.text("Pce/Shpt Weight", weightX, y - 3.5);
  doc.text("Piece", pieceX, y - 3.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(dhl.weightKg, weightX, y + 1);
  doc.text(dhl.piece, pieceX, y + 1);

  // Divider line before Barcodes
  y += 3.5;
  doc.line(margin, y, width - margin, y);

  // 7. Barcode 1: Waybill Barcode
  y += 2;
  const rawWaybill = dhl.waybillFormatted.replace(/\s/g, "");
  drawCode128Pdf(doc, rawWaybill, margin + 12, y, contentWidth - 24, 11);
  y += 13.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(`WAYBILL ${dhl.waybillFormatted}`, width / 2, y, { align: "center" });

  // Divider line
  y += 2.5;
  doc.line(margin, y, width - margin, y);

  // 8. Barcode 2: 2L Routing Barcode
  y += 2.5;
  drawCode128Pdf(doc, dhl.twoLCode, margin + 6, y, contentWidth - 12, 17);
  y += 19.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(dhl.twoLCode, width / 2, y, { align: "center" });

  // Divider line
  y += 2.5;
  doc.line(margin, y, width - margin, y);

  // 9. Barcode 3: J-Code Piece Identifier
  y += 3;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("Ref Code:", margin, y);

  y += 1.5;
  const rawJCode = dhl.jCodeFormatted.replace(/[^A-Za-z0-9]/g, "");
  drawCode128Pdf(doc, rawJCode, margin + 6, y, contentWidth - 12, 17);
  y += 19.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(dhl.jCodeFormatted, width / 2, y, { align: "center" });

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
