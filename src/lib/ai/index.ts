import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// Helper to get Gemini Model (Dynamic to prevent env caching issues)
function getGeminiModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("[AI CONFIG ERROR] GEMINI_API_KEY is missing!");
    throw new Error("GEMINI_API_KEY_NOT_FOUND");
  }
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

// Helper to get OpenAI Client (Dynamic)
function getOpenAIClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    console.error("[AI CONFIG ERROR] OPENAI_API_KEY is missing!");
    throw new Error("OPENAI_API_KEY_NOT_FOUND");
  }
  return new OpenAI({ apiKey: key });
}

export async function getSimpleAIResponse(prompt: string) {
  const startTime = Date.now();
  console.log(`[AI REQUEST] [GEMINI] Starting request at ${new Date().toISOString()}`);

  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log(`[AI SUCCESS] [GEMINI] Status: 200, Latency: ${Date.now() - startTime}ms`);
    return text;
  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.error(`[AI ERROR] [GEMINI]`, {
      provider: "Google Gemini",
      errorCode: error?.code || error?.name || "AI_ERROR",
      errorMessage: error?.message || "An unexpected error occurred",
      latency: `${latency}ms`,
    });
    throw error;
  }
}

export async function getComplexAIResponse(prompt: string) {
  const startTime = Date.now();
  console.log(`[AI REQUEST] [OPENAI] Starting request at ${new Date().toISOString()}`);

  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
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
      errorCode: error?.code || error?.type || "AI_ERROR",
      errorMessage: error?.message || "An unexpected error occurred",
      latency: `${latency}ms`,
    });
    throw error;
  }
}
