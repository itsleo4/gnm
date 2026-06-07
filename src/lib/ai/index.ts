import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Initialize OpenAI
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function getSimpleAIResponse(prompt: string) {
  const startTime = Date.now();
  console.log(`[AI REQUEST] [GEMINI] Starting request at ${new Date().toISOString()}`);

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log(`[AI SUCCESS] [GEMINI] Status: 200, Latency: ${Date.now() - startTime}ms`);
    return text;
  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.error(`[AI ERROR] [GEMINI]`, {
      provider: "Google Gemini",
      status: error?.status || "Unknown",
      errorCode: error?.code || error?.name || "AI_ERROR",
      errorMessage: error?.message || "An unexpected error occurred",
      latency: `${latency}ms`,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

export async function getComplexAIResponse(prompt: string) {
  const startTime = Date.now();
  console.log(`[AI REQUEST] [OPENAI] Starting request at ${new Date().toISOString()}`);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("OPENAI_EMPTY_RESPONSE");

    console.log(`[AI SUCCESS] [OPENAI] Status: 200, Latency: ${Date.now() - startTime}ms`);
    return content;
  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.error(`[AI ERROR] [OPENAI]`, {
      provider: "OpenAI",
      status: error?.status || "Unknown",
      errorCode: error?.code || error?.type || "AI_ERROR",
      errorMessage: error?.message || "An unexpected error occurred",
      latency: `${latency}ms`,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}
