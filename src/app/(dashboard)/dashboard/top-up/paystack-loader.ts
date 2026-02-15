/**
 * Dynamically load Paystack inline script
 */
export function loadPaystack(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as Window & { PaystackPop?: unknown }).PaystackPop) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Paystack script failed to load"));
    document.head.appendChild(script);
  });
}
