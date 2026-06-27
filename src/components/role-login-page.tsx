"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { startHubSession, startMerchantSession } from "@/app/auth/login/actions";

type LoginMode = "admin" | "merchant" | "hub";

const loginContent = {
  admin: {
    eyebrow: "Admin Access",
    title: "DMX Admin",
    body: "Manage operations, pricing, merchants, partners, reports, and bookings from one command center.",
    action: "Continue to Admin",
    href: "/admin/dashboard",
  },
  merchant: {
    eyebrow: "Merchant Access",
    title: "DMX Merchant",
    body: "Book shipments, manage wallet activity, view customers, check rates, and track fulfillment.",
    action: "Continue to Merchant",
    href: "/merchant/dashboard",
  },
  hub: {
    eyebrow: "Hub Access",
    title: "DMX Hub",
    body: "Handle branch tasks, create bookings, scan packages, and manage inventory from the hub workspace.",
    action: "Continue to Hub",
    href: "/hub/dashboard",
  },
} satisfies Record<LoginMode, { eyebrow: string; title: string; body: string; action: string; href: string }>;

export function RoleLoginPage({
  mode,
  error,
}: {
  mode: LoginMode;
  error?: string;
}) {
  const router = useRouter();
  const [logoError, setLogoError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientError, setClientError] = useState("");
  const [email, setEmail] = useState(
    mode === "admin" ? "admin@dmx.com" : mode === "merchant" ? "merchant@dmx.com" : "hub@dmx.com"
  );
  const [password, setPassword] = useState(
    mode === "admin" ? "password123" : mode === "merchant" ? "merchant123" : "hub123"
  );
  const content = loginContent[mode];

  async function handleAdminAccess() {
    setLoading(true);
    setClientError("");
    const result = await signIn("credentials", {
      email,
      password,
      role: "ADMIN",
      redirect: false,
      callbackUrl: content.href,
    });

    if (result?.error) {
      setClientError("Invalid admin login.");
      setLoading(false);
      return;
    }

    router.push(content.href);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12 font-sans">
      <main className="w-full max-w-sm border border-zinc-100 bg-white p-8">
        <div className="mb-8 flex justify-center">
          {!logoError ? (
            <Image
              src="/dmxlogo.svg"
              alt="DMX"
              width={96}
              height={96}
              className="h-24 w-24 object-contain"
              onError={() => setLogoError(true)}
              priority
            />
          ) : (
            <p className="text-center text-2xl font-bold tracking-[0.2em] text-[#5e1914]">DMX</p>
          )}
        </div>

        <p className="text-center text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          {content.eyebrow}
        </p>
        <h1 className="mt-3 text-center text-2xl font-semibold tracking-tighter text-zinc-900">
          {content.title}
        </h1>
        <p className="mt-3 text-center text-sm leading-6 text-zinc-500">
          {content.body}
        </p>

        <div className="mt-8">
          {mode === "admin" ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleAdminAccess();
              }}
              className="space-y-4"
            >
              <LoginFields email={email} password={password} onEmail={setEmail} onPassword={setPassword} />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-none bg-[#5e1914] py-4 text-sm font-medium text-white hover:bg-[#4a130f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Opening..." : content.action}
              </button>
            </form>
          ) : mode === "merchant" ? (
            <form action={startMerchantSession} className="space-y-4">
              <LoginFields email={email} password={password} onEmail={setEmail} onPassword={setPassword} />
              <button
                type="submit"
                className="w-full rounded-none bg-[#5e1914] py-4 text-sm font-medium text-white hover:bg-[#4a130f]"
              >
                {content.action}
              </button>
            </form>
          ) : (
            <form action={startHubSession} className="space-y-4">
              <LoginFields email={email} password={password} onEmail={setEmail} onPassword={setPassword} />
              <button
                type="submit"
                className="w-full rounded-none bg-[#5e1914] py-4 text-sm font-medium text-white hover:bg-[#4a130f]"
              >
                {content.action}
              </button>
            </form>
          )}
        </div>

        {clientError || error === "invalid" ? (
          <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-700">
            {clientError || "Invalid login details."}
          </p>
        ) : null}

        <div className="mt-8 flex justify-center gap-4 text-xs text-zinc-500">
          {mode !== "admin" ? <Link href="/admin/login" className="hover:text-[#5e1914]">Admin</Link> : null}
          {mode !== "merchant" ? <Link href="/merchant/login" className="hover:text-[#5e1914]">Merchant</Link> : null}
          {mode !== "hub" ? <Link href="/hub/login" className="hover:text-[#5e1914]">Hub</Link> : null}
          <Link href="/track" className="hover:text-[#5e1914]">Track</Link>
        </div>
      </main>
    </div>
  );
}

function LoginFields({
  email,
  password,
  onEmail,
  onPassword,
}: {
  email: string;
  password: string;
  onEmail: (value: string) => void;
  onPassword: (value: string) => void;
}) {
  return (
    <div className="space-y-4 text-left">
      <div>
        <label htmlFor="email" className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => onEmail(event.target.value)}
          className="w-full rounded-none border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-[#5e1914] focus:ring-1 focus:ring-[#5e1914]"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => onPassword(event.target.value)}
          className="w-full rounded-none border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-[#5e1914] focus:ring-1 focus:ring-[#5e1914]"
          required
        />
      </div>
    </div>
  );
}
