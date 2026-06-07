import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import OpenAI from "openai";

// --- DEV-ONLY STATUS TRACKING ---
// This will reset on server restart, which is fine for local dev debugging.
let lastAIStatus = {
  provider: "None",
  model: "None",
  apiKeyDetected: false,
  lastStatus: "Idle",
  lastError: null as string | null,
  timestamp: null as string | null
};

export function getInternalAIStatus() {
  return {
    ...lastAIStatus,
    geminiKeyDetected: !!process.env.GEMINI_API_KEY,
    openaiKeyDetected: !!process.env.OPENAI_API_KEY
  };
}

function updateStatus(provider: string, model: string, status: string, error: string | null = null) {
  lastAIStatus = {
    provider,
    model,
    apiKeyDetected: provider === "Gemini" ? !!process.env.GEMINI_API_KEY : !!process.env.OPENAI_API_KEY,
    lastStatus: status,
    lastError: error,
    timestamp: new Date().toISOString()
  };
}
// --------------------------------

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

function getGeminiModel(modelName: string = "gemini-1.5-flash") {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY_MISSING");
  return new GoogleGenerativeAI(key).getGenerativeModel({ model: modelName, safetySettings });
}

function getOpenAIClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY_MISSING");
  return new OpenAI({ apiKey: key });
}

export async function getSimpleAIResponse(prompt: string) {
  const model = "gemini-1.5-flash";
  try {
    const gemini = getGeminiModel(model);
    const result = await gemini.generateContent(prompt);
    const text = result.response.text();
    updateStatus("Gemini", model, "Connected");
    return text;
  } catch (error: any) {
    updateStatus("Gemini", model, `Error ${error.status || "FAIL"}`, error.message);
    throw error;
  }
}

export async function getComplexAIResponse(prompt: string) {
  const model = "gpt-4o-mini";
  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "You are a professional GNM assistant." },
        { role: "user", content: prompt }
      ],
    });
    updateStatus("OpenAI", model, "Connected");
    return response.choices[0].message.content || "";
  } catch (error: any) {
    updateStatus("OpenAI", model, `Error ${error.status || "FAIL"}`, error.message);
    throw error;
  }
}
