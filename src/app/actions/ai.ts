"use server";

import {
  getSimpleAIResponse,
  getComplexAIResponse,
  isAIError,
  formatAIError,
  type AIError,
} from "@/lib/ai";

export interface AIActionResult {
  success: boolean;
  text?: string;
  error?: string;
  /** Only present in development mode for debugging */
  devError?: AIError;
}

export async function askAI(prompt: string, isComplex: boolean): Promise<AIActionResult> {
  if (!prompt?.trim()) {
    return { success: false, error: "Prompt cannot be empty." };
  }

  const result = isComplex
    ? await getComplexAIResponse(prompt)
    : await getSimpleAIResponse(prompt);

  if (isAIError(result)) {
    return {
      success: false,
      error: formatAIError(result),
      devError: process.env.NODE_ENV === "development" ? result : undefined,
    };
  }

  return { success: true, text: result };
}
