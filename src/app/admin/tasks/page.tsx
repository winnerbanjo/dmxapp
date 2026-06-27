import { redirect } from "next/navigation";

export default function RemovedAdminTasksPage() {
  redirect("/admin/dashboard");
}
