"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { askAI } from "./ai";

const RXNORM_BASE = "https://rxnav.nlm.nih.gov/REST";

/**
 * Intelligent Hospital-Grade Search
 */
export async function searchDrugs(query: string) {
  if (!query || query.length < 2) return [];
  try {
    const searchRes = await fetch(`${RXNORM_BASE}/rxcui.json?name=${encodeURIComponent(query)}&search=1`);
    const searchData = await searchRes.json();
    let rxcui = searchData.idGroup?.rxnormId?.[0];
    if (!rxcui) return [];

    const dres = await fetch(`${RXNORM_BASE}/drugs.json?rxcui=${rxcui}`);
    const dData = await dres.json();
    const results: any[] = [];
    if (dData.drugGroup?.conceptGroup) {
      dData.drugGroup.conceptGroup.forEach((group: any) => {
        if (group.conceptProperties) {
          group.conceptProperties.forEach((prop: any) => {
            const name = prop.name.split(' [')[0];
            if (!results.some(r => r.name === name)) {
              results.push({ rxcui: prop.rxcui, name: name });
            }
          });
        }
      });
    }
    return results.slice(0, 5);
  } catch (e) { return []; }
}

/**
 * HIGH-SPEED CLINICAL TURBO (USER-DATA SHIELDED)
 */
export async function getDrugEducation(rxcui: string, name: string) {
  try {
    const supabase = await createClient();
    // Cache is global for speed, but saved drugs (below) are private
    const { data: cached } = await supabase.from("drug_cache").select("drug_data").eq("rxcui", rxcui).maybeSingle();
    if (cached) return cached.drug_data;
  } catch (e) {}

  const prompt = `Act as Odin AI 🫀 Senior Clinical Nurse. Generate a HIGH-SPEED medication brief for ${name}.
Be clinical, direct, NO YAPPING.

### ⚡ FAST SUMMARY
### 💊 CLASS
### 📋 CORE USES
### 👩‍⚕️ NURSING PRIORITY (Assessment/Hold Thresholds)
### ⚠️ SIDE EFFECTS
### 🎓 VIVA WARNING`;

  const result = await askAI(prompt);
  if (result.error) throw new Error("Odin Synthesis Glitch.");

  const drug_data = { rxcui, name, content: result.text, generated_at: new Date() };

  try {
    const supabase = await createClient();
    supabase.from("drug_cache").insert({ rxcui, drug_name: name, drug_data }).catch(() => {});
  } catch (e) {}

  return drug_data;
}

/**
 * Clinical Registry - USER-LOCKED (Private to each user)
 */
export async function saveDrug(name: string, rxcui: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Login required.");

  // STRICT USER-LOCK ENFORCEMENT
  const { error } = await supabase.from("saved_drugs").insert({ 
    user_id: user.id, // LOCKED
    drug_name: name, 
    rxcui, 
    content 
  });

  if (error && error.message.includes("rxcui")) {
     await supabase.from("saved_drugs").insert({ user_id: user.id, drug_name: name, content });
  }
  revalidatePath("/drugs");
  return { success: true };
}

export async function getSavedDrugs() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // STRICT USER-LOCK ENFORCEMENT
  const { data } = await supabase
    .from("saved_drugs")
    .select("*")
    .eq("user_id", user.id) // ONLY MY DATA
    .order("created_at", { ascending: false });

  return data || [];
}

export async function deleteSavedDrug(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Login required.");

  // STRICT USER-LOCK ENFORCEMENT
  const { error } = await supabase
    .from("saved_drugs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id); // CANNOT DELETE OTHERS' DATA

  if (error) throw new Error(error.message);
  revalidatePath("/drugs");
  return { success: true };
}

export async function isDrugSaved(rxcui: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("saved_drugs")
    .select("id")
    .eq("user_id", user.id) // MY DATA ONLY
    .eq("rxcui", rxcui)
    .maybeSingle();

  return !!data;
}
