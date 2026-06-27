import { RoleLoginPage } from "@/components/role-login-page";

export default function MerchantLoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  return <RoleLoginPage mode="merchant" error={searchParams?.error} />;
}
