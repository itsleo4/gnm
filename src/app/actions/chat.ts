"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getChatSessions() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) { console.error("[CHAT] Auth error:", authError.message); return []; }
    if (!user) { console.warn("[CHAT] No user session found"); return []; }

    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false });

    if (error) { console.error("[CHAT] DB fetch error:", error.code, error.message); throw error; }
    return data ?? [];
  } catch (e: any) {
    console.error("[CHAT] getChatSessions failed:", e.message);
    throw e;
  }
}

export async function createChatSession(title: string = "New Conversation") {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) throw new Error(`Auth error: ${authError.message}`);
    if (!user) throw new Error("No authenticated user");

    const { data, error } = await supabase
      .from("chat_sessions")
      .insert([{ title, user_id: user.id }])
      .select()
      .single();

    if (error) { console.error("[CHAT] Insert error:", error.code, error.message, error.details); throw error; }
    
    revalidatePath("/assistant");
    return data;
  } catch (e: any) {
    console.error("[CHAT] createChatSession failed:", e.message);
    throw e;
  }
}

export async function renameChatSession(id: string, title: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("chat_sessions")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/assistant");
}

export async function togglePinChat(id: string, isPinned: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("chat_sessions")
    .update({ is_pinned: isPinned })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/assistant");
}

export async function deleteChatSession(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("chat_sessions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/assistant");
}

export async function getChatMessages(sessionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) { console.error("[CHAT] getChatMessages error:", error.message); return []; }
  return data ?? [];
}

export async function saveChatMessage(sessionId: string, role: "user" | "assistant", content: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
      .from("messages")
      .insert([{ session_id: sessionId, role, content }]);

    if (error) { console.error("[CHAT] saveChatMessage error:", error.code, error.message); throw error; }

    await supabase
      .from("chat_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", sessionId);
  } catch (e: any) {
    console.error("[CHAT] saveChatMessage failed:", e.message);
    throw e;
  }
}
