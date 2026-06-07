"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * FETCH ALL CHAT SESSIONS
 */
export async function getChatSessions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching chats:", error);
    return [];
  }

  return data;
}

/**
 * CREATE NEW CHAT SESSION
 */
export async function createChatSession(title: string = "New Conversation") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert([{ title, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath("/assistant");
  return data;
}

/**
 * RENAME CHAT SESSION
 */
export async function renameChatSession(id: string, title: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("chat_sessions")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id); // Security: verified ownership

  if (error) throw error;
  
  revalidatePath("/assistant");
}

/**
 * TOGGLE PIN STATUS
 */
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

/**
 * DELETE CHAT SESSION
 */
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

/**
 * FETCH MESSAGES FOR A SESSION
 */
export async function getChatMessages(sessionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return data;
}

/**
 * SAVE A MESSAGE
 */
export async function saveChatMessage(sessionId: string, role: "user" | "assistant", content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // First verify session ownership
  const { data: session } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) throw new Error("Access Denied");

  const { error } = await supabase
    .from("messages")
    .insert([{ session_id: sessionId, role, content }]);

  if (error) throw error;

  // Update session activity timestamp
  await supabase
    .from("chat_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", sessionId);
}
