import { createClient } from "./server";

export async function getProfile() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) console.error("[getProfile] DB error:", error.message);
    return profile ?? null;
  } catch (e) {
    console.error("[getProfile] Unexpected error:", e);
    return null;
  }
}

export async function getStats() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: stats, error } = await supabase
      .from('study_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) console.error("[getStats] DB error:", error.message);
    return stats ?? null;
  } catch (e) {
    console.error("[getStats] Unexpected error:", e);
    return null;
  }
}
