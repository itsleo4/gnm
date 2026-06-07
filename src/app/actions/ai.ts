"use server";

import { getSimpleAIResponse, getComplexAIResponse, getInternalAIStatus } from "@/lib/ai";

export type AIResponse = {
  text: string;
  model: string;
  downgraded: boolean;
  error?: false;
} | {
  error: true;
  message: string;
  text?: never;
  model?: never;
  downgraded?: never;
};

export async function askAI(prompt: string, modelProvider: "gemini" | "openai" = "gemini"): Promise<AIResponse> {
  const isDev = process.env.NODE_ENV === "development";

  try {
    if (modelProvider === "openai") {
      const result = await getComplexAIResponse(prompt);
      return {
        text: result.content,
        model: result.modelUsed,
        downgraded: result.downgraded,
        error: false
      };
    } else {
      const text = await getSimpleAIResponse(prompt);
      return {
        text: text,
        model: "gemini-3.5-flash",
        downgraded: false,
        error: false
      };
    }
  } catch (error: any) {
    console.error("AI Action Error:", error);
    
    if (isDev) {
      return {
        error: true,
        message: `[DEV ERROR] ${modelProvider.toUpperCase()} | Status: ${error.status || "FAIL"} | Message: ${error.message || "Unknown error"}`
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
