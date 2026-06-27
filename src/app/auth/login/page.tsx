import { redirect } from "next/navigation";

export default function AuthLoginPage({
  searchParams,
}: {
  searchParams?: { callbackUrl?: string };
}) {
  const callbackUrl = searchParams?.callbackUrl ?? "";

  if (callbackUrl.startsWith("/hub")) {
    redirect("/hub/login");
  }

  if (callbackUrl.startsWith("/merchant")) {
    redirect("/merchant/login");
  }

  redirect("/admin/login");
}
