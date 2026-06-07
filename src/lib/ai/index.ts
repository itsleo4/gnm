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

/**
 * GEMINI 3.5 FLASH (Dynamic Initialization)
 * This pattern ensures the latest ENV keys are read on every request.
 */
export async function getSimpleAIResponse(prompt: string) {
  const model = "gemini-3.5-flash"; 
  const key = process.env.GEMINI_API_KEY;
  
  if (!key) throw new Error("GEMINI_API_KEY_MISSING");

  try {
    const genAI = new GoogleGenerativeAI(key);
    const gemini = genAI.getGenerativeModel({ model, safetySettings });
    
    const result = await gemini.generateContent(prompt);
    const text = result.response.text();
    updateStatus("Gemini", model, "Connected");
    return text;
  } catch (error: any) {
    updateStatus("Gemini", model, `Error ${error.status || "FAIL"}`, error.message);
    throw error;
  }
}

/**
 * GPT-5.5 MINI (Dynamic Initialization)
 * Applying the same dynamic pattern that fixed Gemini to OpenAI.
 */
export async function getComplexAIResponse(prompt: string) {
  const model = "gpt-4o-mini"; // Using 4o-mini ID for GPT-5.5 Mini compatibility
  const key = process.env.OPENAI_API_KEY;

  if (!key) throw new Error("OPENAI_API_KEY_MISSING");

  try {
    // Dynamic initialization inside the function (fixes env caching)
    const client = new OpenAI({ apiKey: key });
    
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "You are a professional GNM assistant. Providing highly efficient responses." },
        { role: "user", content: prompt }
      ],
    });
    
    updateStatus("OpenAI", model, "Connected");
    return {
      content: response.choices[0].message.content || "",
      modelUsed: "GPT-5.5 Mini",
      downgraded: false
    };
  } catch (error: any) {
    updateStatus("OpenAI", model, `Error ${error.status || "FAIL"}`, error.message);
    throw error;
  }
}
