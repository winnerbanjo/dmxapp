"use client";

import Link from "next/link";

export default function HubUpdateStatusPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        Update Status
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Update shipment status by tracking ID (demo).
      </p>
      <div className="mt-8 border border-zinc-100 bg-white p-8">
        <input
          type="text"
          placeholder="Tracking ID"
          className="w-full rounded-none border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-0"
        />
        <select className="mt-4 w-full rounded-none border border-zinc-200 bg-white px-4 py-3 text-zinc-900 focus:border-[#5e1914] focus:outline-none">
          <option>Picked up</option>
          <option>In transit</option>
          <option>Out for delivery</option>
          <option>Delivered</option>
        </select>
        <Link
          href="/hub/dashboard"
          className="mt-4 inline-block w-full rounded-none bg-[#5e1914] py-3 text-center text-sm font-medium text-white hover:bg-[#4a130f]"
        >
          Update
        </Link>
      </div>
    </div>
  );
}
