import Link from 'next/link';

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-zinc-800">
          Admin Login
        </h1>
        <p className="mb-4 text-center text-zinc-600">
          Please sign in to access the admin dashboard.
        </p>
        <div className="flex justify-center">
          <Link
            href="/auth/login?callbackUrl=/admin"
            className="rounded bg-[#5e1914] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7e1e18]"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
