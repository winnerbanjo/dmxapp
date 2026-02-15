"use client";

import Link from "next/link";

export default function HubRegisterWalkinPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        Register Walk-in Customer
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Add a new walk-in customer (demo — no database).
      </p>
      <div className="mt-8 border border-zinc-100 bg-white p-8">
        <input
          type="text"
          placeholder="Full name"
          className="w-full rounded-none border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-0"
        />
        <input
          type="tel"
          placeholder="Phone"
          className="mt-4 w-full rounded-none border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-0"
        />
        <Link
          href="/hub/dashboard"
          className="mt-4 inline-block w-full rounded-none bg-[#5e1914] py-3 text-center text-sm font-medium text-white hover:bg-[#4a130f]"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
