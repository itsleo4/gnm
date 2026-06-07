import { createClient } from "@/lib/supabase/server";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Check auth first — if no user, proxy should have caught this, but be safe
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile — but DO NOT redirect to login if it's missing.
  // A missing profile = new user whose trigger hasn't fired yet, not an auth failure.
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: stats } = await supabase
    .from('study_stats')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Pass profile (may be null for brand new users) — DashboardClient handles nulls gracefully
  return <DashboardClient profile={profile} stats={stats} />;
}
