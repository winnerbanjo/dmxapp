/** Value for the structured address field group (Street, LGA, State, etc.). */
export type StructuredAddressValue = {
  streetAddress: string;
  lga: string;
  state: string;
  apartment: string;
  landmark: string;
  lat?: number;
  lng?: number;
};

export const emptyStructuredAddress = (): StructuredAddressValue => ({
  streetAddress: "",
  lga: "",
  state: "",
  apartment: "",
  landmark: "",
});

/** Build a single-line display address from structured fields. */
export function formatStructuredAddress(v: StructuredAddressValue): string {
  const parts = [v.streetAddress, v.lga, v.state].filter(Boolean);
  let line = parts.join(", ");
  if (v.apartment) line += `, ${v.apartment}`;
  if (v.landmark) line += ` (Landmark: ${v.landmark})`;
  return line;
}
