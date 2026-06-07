import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import OpenAI from "openai";

// --- DEV-ONLY STATUS TRACKING ---
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

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

function getGeminiModel(modelName: string = "gemini-3.5-flash") {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY_MISSING");
  
  // Initialize with the v1 version explicitly to support the newest Gemini 3.5 architecture
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ 
    model: modelName, 
    safetySettings 
  });
}

function getOpenAIClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY_MISSING");
  return new OpenAI({ apiKey: key });
}

export async function getSimpleAIResponse(prompt: string) {
  // UPGRADED TO GEMINI 3.5 FLASH (Launched May 2026)
  const model = "gemini-3.5-flash"; 
  try {
    const gemini = getGeminiModel(model);
    const result = await gemini.generateContent(prompt);
    const text = result.response.text();
    updateStatus("Gemini", model, "Connected");
    return text;
  } catch (error: any) {
    console.error("[GEMINI 3.5 ERROR]", error);
    updateStatus("Gemini", model, `Error ${error.status || "FAIL"}`, error.message);
    
    // Automatic fallback to 1.5 if the account hasn't been provisioned for 3.5 yet
    if (error?.status === 404) {
      try {
        const fallbackModel = "gemini-1.5-flash";
        const geminiFallback = getGeminiModel(fallbackModel);
        const result = await geminiFallback.generateContent(prompt);
        return result.response.text();
      } catch (inner) {
        throw error; // Throw original 404
      }
    }
    throw error;
  }
}

export async function getComplexAIResponse(prompt: string) {
  // Using gpt-4o as the complex counterpart
  const model = "gpt-4o";
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
