import { RoleLoginPage } from "@/components/role-login-page";

export default function HubLoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  return <RoleLoginPage mode="hub" error={searchParams?.error} />;
}
