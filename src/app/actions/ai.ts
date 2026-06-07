"use server";

import { getSimpleAIResponse, getComplexAIResponse } from "@/lib/ai";

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
    
    if (isDev) {
      return `[DEV ERROR] ${model === "openai" ? "OpenAI" : "Gemini"}: ${error.message || "Unknown error"}`;
    }

    return "The AI assistant is temporarily unavailable. Please try again in a few moments.";
  }
}

