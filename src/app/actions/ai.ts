"use server";

import { getSimpleAIResponse, getInternalAIStatus } from "@/lib/ai";

/**
 * Legacy non-streaming wrapper for the NCP Generator and other pages.
 * Purged of all OpenAI logic.
 */
export async function askAI(prompt: string) {
  try {
    const text = await getSimpleAIResponse(prompt);
    return {
      text: text,
      model: "gemini-3.5-flash",
      error: false
    };
  } catch (error: any) {
    console.error("AI Action Error:", error);
    return {
      error: true,
      message: "The AI assistant is temporarily unavailable."
    };
  }
}

export async function getAIStatus() {
  if (process.env.NODE_ENV !== "development") return null;
  return getInternalAIStatus();
}
