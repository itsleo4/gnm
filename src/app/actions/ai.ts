"use server";

import { getSimpleAIResponse, getInternalAIStatus } from "@/lib/ai";

/**
 * Server action for non-streaming AI requests (NCP, Drug Info, etc.)
 */
export async function askAI(prompt: string) {
  try {
    const text = await getSimpleAIResponse(prompt);
    return {
      text: text || "No response received.",
      model: "gemini-3.5-flash",
      error: false
    };
  } catch (error: any) {
    console.error("AI Action Error:", error);
    return {
      error: true,
      text: "", // Ensure text is always a string to prevent TS errors
      message: "The AI assistant is temporarily unavailable."
    };
  }
}

export async function getAIStatus() {
  if (process.env.NODE_ENV !== "development") return null;
  return getInternalAIStatus();
}
