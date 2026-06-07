"use server";

import { getSimpleAIResponse, getComplexAIResponse } from "@/lib/ai";

export async function askAI(prompt: string, isComplex: boolean) {
  if (isComplex) {
    return await getComplexAIResponse(prompt);
  } else {
    return await getSimpleAIResponse(prompt);
  }
}
