import { generateBarcodeSvg } from "./barcode";
import type { ShipmentDocData } from "./shipment-document";

export interface DhlLabelModel {
  dateStr: string;
  shipper: {
    name: string;
    company: string;
    address: string;
    cityState: string;
    country: string;
  };
  originAirport: string;
  receiver: {
    name: string;
    company: string;
    address: string;
    cityStatePostal: string;
    country: string;
    contact: string;
  };
  routingCode: string;
  serviceCode: string;
  refNo: string;
  content: string;
  weightKg: string;
  piece: string;
  waybillFormatted: string;
  waybillBarcodeSvg: string;
  twoLCode: string;
  twoLBarcodeSvg: string;
  jCodeFormatted: string;
  jCodeBarcodeSvg: string;
}

export function formatDhlLabelData(data: ShipmentDocData): DhlLabelModel {
  const dateObj = new Date(data.dateAdded || Date.now());
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;

  // 1. Origin Airport Code (e.g. LOS for Murtala Muhammed International Airport Lagos)
  let originAirport = "LOS";
  const shipperCity = (data.shipper.city || "").toLowerCase();
  if (shipperCity.includes("abuja")) originAirport = "ABV";
  else if (shipperCity.includes("kano")) originAirport = "KAN";
  else if (shipperCity.includes("london") || shipperCity.includes("heathrow")) originAirport = "LHR";
  else if (shipperCity.includes("york") || shipperCity.includes("jfk")) originAirport = "JFK";

  // 2. Destination Country ISO2 & Routing
  const destCountry = (data.receiver.country || "UNITED KINGDOM").toUpperCase();
  let iso2 = "GB";
  let routingCode = "FC03 GB-MSE-MSE .";
  if (destCountry.includes("STATES") || destCountry.includes("USA") || destCountry === "US") {
    iso2 = "US";
    routingCode = "1D US-JFK-NYC .";
  } else if (destCountry.includes("CANADA") || destCountry === "CA") {
    iso2 = "CA";
    routingCode = "YVR CA-YVR-VAN .";
  } else if (destCountry.includes("GERMANY") || destCountry === "DE") {
    iso2 = "DE";
    routingCode = "FRA DE-FRA-CGN .";
  } else if (destCountry.includes("FRANCE") || destCountry === "FR") {
    iso2 = "FR";
    routingCode = "CDG FR-CDG-PAR .";
  } else if (destCountry.includes("NIGERIA") || destCountry === "NG") {
    iso2 = "NG";
    routingCode = "LOS NG-LOS-APAPA .";
  }

  // 3. 10-Digit Waybill Number
  const rawNum = (data.dhlTrackingNumber || data.trackingNumber).replace(/\D/g, "");
  let paddedNum = rawNum;
  if (paddedNum.length < 10) {
    paddedNum = (paddedNum + "480925855").slice(0, 10);
  } else if (paddedNum.length > 10) {
    paddedNum = paddedNum.slice(0, 10);
  }
  const waybillFormatted = `${paddedNum.slice(0, 2)} ${paddedNum.slice(2, 6)} ${paddedNum.slice(6, 10)}`;

  // 4. Clean Postal & 2L Routing Code
  const cleanPostal = (data.receiver.postalCode || "ME4 4FW").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const twoLCode = `(2L)${iso2}${cleanPostal}+48000001`;

  // 5. DHL J-Code (JD01 piece license plate)
  const pieceSeq = (paddedNum + "012876984169").slice(0, 16);
  const jCodeRaw = `JJD01${pieceSeq}`;
  const jCodeFormatted = `(J) JD01 ${pieceSeq.slice(0, 4)} ${pieceSeq.slice(4, 8)} ${pieceSeq.slice(8, 12)} ${pieceSeq.slice(12, 16)}`;

  // 6. Ref No (MongoDB ObjectId 24-character hex or fallback)
  let refNo = data.id || "";
  if (!/^[a-f0-9]{24}$/i.test(refNo)) {
    refNo = "6acf9c6b1665d3eba7293a26";
  }

  // 7. Content Description
  const firstItem = data.items[0];
  const content = firstItem?.name || "Women Blue Cotton Dress";

  // 8. Generate Crisp SVGs for the 3 Barcodes
  const waybillBarcodeSvg = generateBarcodeSvg(paddedNum, 50, 2);
  const twoLBarcodeSvg = generateBarcodeSvg(twoLCode, 75, 1.6);
  const jCodeBarcodeSvg = generateBarcodeSvg(jCodeRaw, 75, 1.5);

  const postalCityState = [data.receiver.postalCode, data.receiver.city, data.receiver.state]
    .filter(Boolean)
    .join(" ");

  return {
    dateStr,
    shipper: {
      name: data.shipper.name || "Wakaddy Empire",
      company: data.shipper.company || data.shipper.name || "Wakaddy Empire",
      address: data.shipper.address || "3, Oriwu Street, Lekki Phase I",
      cityState: `${data.shipper.city || "Lagos"} ${data.shipper.state || "Lagos"}`,
      country: (data.shipper.country || "NIGERIA").toUpperCase(),
    },
    originAirport,
    receiver: {
      name: data.receiver.name || "Olabisi Solomon",
      company: data.receiver.company || data.receiver.name || "Olabisi Solomon",
      address: data.receiver.address || "6, Pumpmakers Way",
      cityStatePostal: postalCityState || "ME4 4FW Chatham England",
      country: destCountry,
      contact: data.receiver.phone || "",
    },
    routingCode,
    serviceCode: "C-ADI",
    refNo,
    content,
    weightKg: `${data.actualWeight.toFixed(1)} kg`,
    piece: "1/1",
    waybillFormatted,
    waybillBarcodeSvg,
    twoLCode,
    twoLBarcodeSvg,
    jCodeFormatted,
    jCodeBarcodeSvg,
  };
}
