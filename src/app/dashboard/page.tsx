import { getProfile, getStats } from "@/lib/supabase/data";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const profile = await getProfile();
  const stats = await getStats();

  if (!profile) {
    redirect("/login");
  }

  return <DashboardClient profile={profile} stats={stats} />;
}
