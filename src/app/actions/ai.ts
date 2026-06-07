"use server";

import { getSimpleAIResponse, getComplexAIResponse, getInternalAIStatus } from "@/lib/ai";

export async function askAI(prompt: string, model: "gemini" | "openai" = "gemini") {
  const isDev = process.env.NODE_ENV === "development";

  try {
    if (model === "openai") {
      const result = await getComplexAIResponse(prompt);
      // We return an object now for OpenAI to handle the downgrade UI
      return {
        text: result.content,
        model: result.modelUsed,
        downgraded: result.downgraded
      };
    } else {
      const text = await getSimpleAIResponse(prompt);
      return {
        text: text,
        model: "gemini-3.5-flash",
        downgraded: false
      };
    }
  } catch (error: any) {
    console.error("AI Action Error:", error);
    
    if (isDev) {
      return {
        error: true,
        message: `[DEV ERROR] ${model.toUpperCase()} | Status: ${error.status || "FAIL"} | Message: ${error.message || "Unknown error"}`
      };
    }

    return {
      error: true,
      message: "The AI assistant is temporarily unavailable. Please try again in a few moments."
    };
  }
}

export async function getAIStatus() {
  if (process.env.NODE_ENV !== "development") return null;
  return getInternalAIStatus();
}
