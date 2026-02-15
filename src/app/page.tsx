import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <main className="w-full max-w-sm space-y-10 text-center">
        <p className="text-2xl font-bold tracking-[0.2em] text-[#5e1914]">DMX</p>
        <p className="text-sm text-zinc-500">Ship smarter. Track easier.</p>
        <div className="flex flex-col gap-4">
          <Link
            href="/auth/login"
            className="rounded-none border border-[#5e1914] bg-[#5e1914] px-8 py-4 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#4a130f] hover:shadow-md"
          >
            Merchant Sign In
          </Link>
          <Link
            href="/auth/login"
            className="rounded-none border border-zinc-100 bg-white px-8 py-4 text-sm font-medium text-zinc-900 transition-all hover:-translate-y-0.5 hover:bg-zinc-50"
          >
            Sign In
          </Link>
          <Link
            href="/track"
            className="rounded-none border border-zinc-100 bg-white px-8 py-4 text-sm font-medium text-zinc-700 transition-all hover:-translate-y-0.5 hover:bg-zinc-50"
          >
            Track a package
          </Link>
        </div>
      </main>
    </div>
  );
}
