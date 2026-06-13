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
      model: "gemini-2.5-flash",
      error: false
    };
  } catch (error: any) {
    console.error("CRITICAL AI ACTION ERROR:", {
      message: error.message,
      stack: error.stack,
      status: error.status
    });
    return {
      error: true,
      text: "", 
      message: "The AI assistant is temporarily unavailable. (" + (error.message || "Unknown Error") + ")"
    };
  }
}

export async function getAIStatus() {
  if (process.env.NODE_ENV !== "development") return null;
  return getInternalAIStatus();
}
