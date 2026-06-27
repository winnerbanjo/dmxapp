import { RoleLoginPage } from "@/components/role-login-page";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  return <RoleLoginPage mode="admin" error={searchParams?.error} />;
}
