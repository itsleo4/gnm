import { createClient } from "./server";

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error.message);
  }

  return profile;
}

export async function getStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: stats, error } = await supabase
    .from('study_stats')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error("Error fetching stats:", error.message);
  }

  return stats;
}
