"use server";

import { getSimpleAIResponse, getComplexAIResponse, getInternalAIStatus } from "@/lib/ai";

export async function askAI(prompt: string, model: "gemini" | "openai" = "gemini") {
  const isDev = process.env.NODE_ENV === "development";

  try {
    if (model === "openai") {
      return await getComplexAIResponse(prompt);
    } else {
      return await getSimpleAIResponse(prompt);
    }
  } catch (error: any) {
    console.error("AI Action Error:", error);
    
    // In dev, provide specific error info. In prod, keep it clean.
    if (isDev) {
      return `[DEV ERROR] ${model.toUpperCase()} | Status: ${error.status || "FAIL"} | Message: ${error.message || "Unknown error"}`;
    }

    return "The AI assistant is temporarily unavailable. Please try again in a few moments.";
  }
}

export async function getAIStatus() {
  // Only return status in development
  if (process.env.NODE_ENV !== "development") return null;
  return getInternalAIStatus();
}
