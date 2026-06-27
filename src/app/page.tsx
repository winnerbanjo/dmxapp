import { RoleLoginPage } from "@/components/role-login-page";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return <RoleLoginPage mode="admin" />;
}
