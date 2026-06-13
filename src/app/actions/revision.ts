"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/* --- SUBJECTS --- */

export async function getSubjects() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("subjects")
    .select("*, topics(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch subjects error:", error);
    return [];
  }
  return data;
}

export async function addSubject(name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("subjects")
    .insert({ name, user_id: user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/revision");
  return data;
}

export async function deleteSubject(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("subjects")
    .delete()
    .match({ id });

  if (error) throw new Error(error.message);
  revalidatePath("/revision");
  return { success: true };
}

/* --- TOPICS --- */

export async function getTopics(subjectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("subject_id", subjectId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return data;
}

export async function addTopic(subjectId: string, name: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("topics")
    .insert({ subject_id: subjectId, name, status: "Not Started", confidence_score: 0 })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/revision");
  return data;
}

export async function updateTopicStatus(topicId: string, updates: any) {
  const supabase = await createClient();
  
  // Calculate next review based on simplified spaced repetition logic if score is provided
  if (updates.confidence_score !== undefined) {
    const daysToAdd = [1, 3, 7, 14, 30][Math.min(updates.confidence_score, 4)];
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    updates.next_review_date = nextDate.toISOString();
  }

  const { data, error } = await supabase
    .from("topics")
    .update(updates)
    .match({ id: topicId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  // Log revision
  const { data: { user } } = await supabase.auth.getUser();
  if (user && updates.confidence_score) {
    await supabase.from("revision_logs").insert({
      topic_id: topicId,
      score: updates.confidence_score
    });
  }

  revalidatePath("/revision");
  return data;
}

/* --- DASHBOARD STATS --- */

export async function getRevisionStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: topics } = await supabase
    .from("topics")
    .select("*, subjects!inner(user_id)")
    .eq("subjects.user_id", user.id);

  if (!topics) return null;

  const now = new Date();
  const dueToday = topics.filter(t => t.next_review_date && new Date(t.next_review_date) <= now).length;
  const mastered = topics.filter(t => t.status === "Mastered").length;
  const needsRevision = topics.filter(t => t.status === "Needs Revision").length;
  const total = topics.length;

  const readiness = total > 0 ? Math.round((mastered / total) * 100) : 0;

  return {
    totalTopics: total,
    dueToday,
    mastered,
    needsRevision,
    readiness
  };
}

/* --- TOPIC DETAILS & WORKSPACE --- */

export async function getTopicDetails(topicId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("topic_details")
    .select("*")
    .eq("topic_id", topicId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found'
    console.error("Fetch topic details error:", error);
    return null;
  }

  if (!data) {
    // Initialize if not exists
    const { data: newData, error: insertError } = await supabase
      .from("topic_details")
      .insert({ topic_id: topicId })
      .select()
      .single();
    
    if (insertError) return null;
    return newData;
  }

  return data;
}

export async function updateTopicDetails(topicId: string, updates: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("topic_details")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .match({ topic_id: topicId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/revision");
  return data;
}

const NURSING_PROMPTS = {
  notes: (topic: string, mode: 'detailed' | 'quick' | 'exam' | 'clinical' | 'nursing') => {
    const base = `Odin AI 🫀: Acting as a Senior Nursing Educator, generate ELITE, ACCURATE nursing knowledge for: "${topic}". 
    CRITICAL: No introductions, no self-mentions like "As an AI", no "Here is your...". Start immediately with content.`;
    
    if (mode === 'detailed') {
      return `${base} 
      Structure into 16 ENCYCLOPEDIC NURSING sections (Book-style):
      1. Introduction
      2. formal Definition
      3. Applied Anatomy & Physiology
      4. Detailed Etiology & Risk Factors
      5. Clinical Types/Classification
      6. Pathophysiology (Step-by-step mechanism)
      7. Symptoms & Clinical Manifestations
      8. Diagnostic Lab/Imaging Investigations
      9. Medical & Pharmacological Management
      10. Surgical Management
      11. Nursing Management (ADPIE Framework: Extremely detailed)
      12. Practical Clinical Responsibilities
      13. Possible Complications
      14. Discharge Planning & Health Education
      15. Critical Viva Questions
      16. Final Exam-Point Summary.
      Use professional medical fonts (standard Markdown) and clear hierarchies.`;
    }
    
    if (mode === 'quick') {
      return `${base} Direct, high-impact summary (<400 words). Focus: Definition, Signs, Nursing Priority.`;
    }

    return `${base} Structure as a 15-mark descriptive university exam answer. Use headings and professional medical jargon.`;
  },

  recall: (topic: string, difficulty: 'easy' | 'medium' | 'exam' | 'university') => {
    return `Odin AI 🫀: Generate 5 unique exam questions for: "${topic}". Difficulty: ${difficulty}.
    No fluff. Return ONLY a JSON array of strings: ["q1", "q2", ...]`;
  },

  viva: (topic: string) => `Odin AI 🫀: Generate 10 critical Viva questions for: "${topic}". 
  No fluff. Return only a JSON array of strings: ["q1", "q2", ...]`,

  caseStudy: (topic: string) => `Odin AI 🫀: Generate a Nursing Case Study for: "${topic}".
  Focus: Clinical reasoning. Return ONLY JSON: { "scenario": "...", "questions": ["...", "..."] }`,

  summaries: (topic: string) => `Odin AI 🫀: Create 3 levels of scientific compression for: "${topic}". 
  No fluff. Return ONLY JSON: { "level1": "...", "level2": "...", "level3": "..." }`
};

import { askAI } from "./ai";

export async function generateTopicContent(
  topicId: string, 
  topicName: string, 
  type: 'notes' | 'recall' | 'summaries' | 'viva' | 'caseStudy',
  options: any = {}
) {
  const prompt = type === 'notes' 
    ? NURSING_PROMPTS.notes(topicName, options.mode || 'detailed')
    : type === 'recall'
    ? NURSING_PROMPTS.recall(topicName, options.difficulty || 'exam')
    : (NURSING_PROMPTS as any)[type](topicName);

  const result = await askAI(prompt);
  if (result.error) throw new Error(result.message);
  
  try {
    let text = result.text.trim();
    const supabase = await createClient();
    const { data: current } = await supabase.from("topic_details").select("*").eq("topic_id", topicId).single();
    const update: any = {};

    if (type === 'notes') {
      // Notes are stored as raw text to prevent JSON parse errors on large content
      update.smart_notes = { ...(current?.smart_notes || {}), [options.mode || 'detailed']: text };
    } else {
      // For structured data, we still use JSON
      let jsonStr = text;
      if (jsonStr.startsWith("```json")) jsonStr = jsonStr.replace(/^```json/, "").replace(/```$/, "");
      else if (jsonStr.startsWith("```")) jsonStr = jsonStr.replace(/^```/, "").replace(/```$/, "");
      
      const parsedData = JSON.parse(jsonStr);
      
      if (type === 'recall') {
        const existing = current?.recall_questions?.questions || [];
        update.recall_questions = { questions: [...existing, ...parsedData] };
      }
      if (type === 'viva') update.recall_questions = { ...(current?.recall_questions || {}), viva: parsedData };
      if (type === 'caseStudy') update.recall_questions = { ...(current?.recall_questions || {}), caseStudy: parsedData };
      if (type === 'summaries') update.summaries = parsedData;
    }
    
    await updateTopicDetails(topicId, update);
    return true;
  } catch (e) {
    console.error("AI Parse Error:", e);
    throw new Error("Learning content generation failed. Try a shorter mode or check AI status.");
  }
}

export async function evaluateRecallAnswer(topicName: string, question: string, answer: string) {
  const prompt = `You are a nursing exam evaluator. Evaluate the following student answer for the topic "${topicName}".
Question: "${question}"
Student Answer: "${answer}"

Provide evaluation in this JSON format:
{
  "coverage": 85, (percentage)
  "missingPoints": ["Point 1", "Point 2"],
  "strengths": ["Strength 1"],
  "suggestedMarks": "8/10",
  "feedback": "Overall good summary..."
}`;

  const result = await askAI(prompt);
  if (result.error) throw new Error(result.message);

  try {
    let jsonStr = result.text.trim();
    if (jsonStr.startsWith("```json")) jsonStr = jsonStr.replace(/^```json/, "").replace(/```$/, "");
    const evalData = JSON.parse(jsonStr);
    return evalData;
  } catch (e) {
    throw new Error("Failed to evaluate answer.");
  }
}
