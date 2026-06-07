"use server";

import { getSimpleAIResponse, getComplexAIResponse } from "@/lib/ai";

export async function askAI(prompt: string, isComplex: boolean) {
  const isDev = process.env.NODE_ENV === "development";

  try {
    if (isComplex) {
      return await getComplexAIResponse(prompt);
    } else {
      return await getSimpleAIResponse(prompt);
    }
  } catch (error: any) {
    // Detailed server-side logging is already handled in lib/ai
    
    if (isDev) {
      return `[DEV ERROR] ${isComplex ? "OpenAI" : "Gemini"}: ${error.message || "Unknown error"}`;
    }

    return "The AI assistant is temporarily unavailable. Please try again in a few moments.";
  }
}
