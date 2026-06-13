import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// --- SYSTEM PROMPT ---
const NURSING_SYSTEM_PROMPT = `You are "Odin AI 🫀", a senior nursing lead with sharp clinical intuition.
Speak like a human expert: focused, natural, and direct.

RULES:
1. NO BOT-CHATTER: Avoid "I am an AI", "Here is your info", or "As a mentor".
2. INSTANT TRUTH: Start your response immediately with the answer. Don't waste time on intros.
3. HUMAN FLOW: Use a professional yet natural tone. Don't be a rigid bot; be a knowledgeable colleague.
4. TOPIC LOCK: Stay strictly on what was asked. No tangential fluff.
5. EXPERT DEPTH: Use your intuition to prioritize what's clinically important (ADPIE, Patho, Priority Care).
6. IDENTITY: You are Odin AI 🫀. Knowledge delivered with natural authority.`;

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
  };
}

function updateStatus(model: string, status: string, error: string | null = null) {
  lastAIStatus = {
    provider: "Odin AI 🫀",
    model,
    apiKeyDetected: !!process.env.GEMINI_API_KEY,
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

let discoveredModel: string | null = null;

async function selectBestModel(key: string): Promise<string> {
  if (discoveredModel) return discoveredModel as string;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    
    if (data.models) {
      const flashModels = data.models
        .filter((m: any) => m.name.toLowerCase().includes("flash") && m.supportedGenerationMethods.includes("generateContent"))
        .map((m: any) => m.name.replace("models/", ""))
        .sort((a: string, b: string) => b.localeCompare(a));

      if (flashModels.length > 0) {
        discoveredModel = flashModels[0];
        console.log(`[AI DISCOVERY] Using latest detected Flash model: ${discoveredModel}`);
        return discoveredModel as string;
      }
    }
  } catch (e) {
    console.error("[AI DISCOVERY ERROR] Failed to list models:", e);
  }

  const fallback = "gemini-1.5-flash";
  discoveredModel = fallback; 
  return fallback;
}

async function getModel(key: string) {
  const modelName = await selectBestModel(key);
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ 
    model: modelName, 
    safetySettings,
    systemInstruction: NURSING_SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 8192,
    }
  });
}

/**
 * GEMINI DYNAMIC STREAM
 */
export async function* getGeminiStreamResponse(prompt: string) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY_MISSING");

  try {
    const model = await getModel(key);
    const modelName = discoveredModel || "Unknown";
    const result = await model.generateContentStream(prompt);
    
    updateStatus(discoveredModel || "Gemini", "Streaming Started");
    for await (const chunk of result.stream) {
      yield chunk.text();
    }
    updateStatus(discoveredModel || "Gemini", "Connected (Stream Finished)");
  } catch (error: any) {
    console.error("[GEMINI STREAM ERROR]", error);
    updateStatus(discoveredModel || "Gemini", `Error ${error.status || "FAIL"}`, error.message);
    throw error;
  }
}

/**
 * GEMINI DYNAMIC DIRECT
 */
export async function getSimpleAIResponse(prompt: string) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY_MISSING");

  try {
    const model = await getModel(key);
    updateStatus(discoveredModel || "Gemini", "Direct Request Started");
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    updateStatus(discoveredModel || "Gemini", "Connected (Direct Success)");
    return text;
  } catch (error: any) {
    console.error("[GEMINI DIRECT ERROR]", error);
    updateStatus(discoveredModel || "Gemini", `Error ${error.status || "FAIL"}`, error.message);
    throw error;
  }
}
