"use client";

import { useMemo, useState } from "react";

const CITIES = ["Lagos", "Abuja", "Kano", "Port Harcourt", "Ibadan", "Enugu"];

type Option = { service: string; eta: string; price: number };

function getRouteFactor(origin: string, destination: string): number {
  if (!origin || !destination || origin === destination) return 1;
  const major = new Set(["Lagos", "Abuja", "Kano"]);
  if (major.has(origin) && major.has(destination)) return 1.15;
  return 1.3;
}

function computeOptions(origin: string, destination: string, weight: number, declaredValue: number): Option[] {
  const base = Math.round((1800 + weight * 550) * getRouteFactor(origin, destination));
  const insurance = Math.round(Math.max(0, declaredValue) * 0.005);
  return [
    { service: "Economy", eta: "2-4 business days", price: base + insurance },
    { service: "Express", eta: "1-2 business days", price: Math.round(base * 1.25) + insurance },
    { service: "Priority", eta: "Same day / next day", price: Math.round(base * 1.55) + insurance },
  ];
}

export default function MerchantRateCheckerPage() {
  const [origin, setOrigin] = useState("Lagos");
  const [destination, setDestination] = useState("Abuja");
  const [weight, setWeight] = useState("2");
  const [declaredValue, setDeclaredValue] = useState("");

  const weightNum = Math.max(0, parseFloat(weight) || 0);
  const declaredNum = Math.max(0, parseFloat(declaredValue) || 0);

  const options = useMemo(
    () => computeOptions(origin, destination, weightNum, declaredNum),
    [origin, destination, weightNum, declaredNum]
  );

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Nationwide Rate Checker</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Enter shipment data to view all available service options, pricing, and estimated delivery times.
      </p>

      <div className="mt-8 border border-zinc-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-sm text-zinc-700">Origin</label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="mt-2 h-11 w-full rounded-none border border-zinc-200 bg-white px-3 text-sm text-zinc-900"
            >
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-zinc-700">Destination</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="mt-2 h-11 w-full rounded-none border border-zinc-200 bg-white px-3 text-sm text-zinc-900"
            >
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-zinc-700">Weight (kg)</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="mt-2 h-11 w-full rounded-none border border-zinc-200 px-3 text-sm text-zinc-900"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-700">Declared Value (optional)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={declaredValue}
              onChange={(e) => setDeclaredValue(e.target.value)}
              className="mt-2 h-11 w-full rounded-none border border-zinc-200 px-3 text-sm text-zinc-900"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="px-6 py-4 font-medium text-zinc-900">Service Option</th>
              <th className="px-6 py-4 font-medium text-zinc-900">Estimated Delivery</th>
              <th className="px-6 py-4 font-medium text-zinc-900">Price</th>
            </tr>
          </thead>
          <tbody>
            {options.map((option) => (
              <tr key={option.service} className="border-b border-zinc-100 last:border-b-0">
                <td className="px-6 py-4 font-medium text-zinc-900">{option.service}</td>
                <td className="px-6 py-4 text-zinc-700">{option.eta}</td>
                <td className="px-6 py-4 text-zinc-900">
                  {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(option.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
