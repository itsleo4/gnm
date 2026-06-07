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
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: modelName, safetySettings });
}

function getOpenAIClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY_MISSING");
  return new OpenAI({ apiKey: key });
}

export async function getSimpleAIResponse(prompt: string) {
  const model = "gemini-3.5-flash"; 
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

/**
 * Advanced GPT handler with auto-downgrade logic for GPT-5.5 series
 */
export async function getComplexAIResponse(prompt: string, forcedModel?: string) {
  const primaryModel = forcedModel || "gpt-5.5-instant";
  const fallbackModel = "gpt-5.5-mini";
  
  const client = getOpenAIClient();
  
  try {
    // Attempt with Primary Model (GPT-5.5 Instant)
    const response = await client.chat.completions.create({
      model: primaryModel,
      messages: [
        { role: "system", content: "You are a professional GNM assistant." },
        { role: "user", content: prompt }
      ],
    });
    
    updateStatus("OpenAI", primaryModel, "Connected");
    return {
      content: response.choices[0].message.content || "",
      modelUsed: primaryModel,
      downgraded: false
    };
  } catch (error: any) {
    // Check if it's a Rate Limit (429) or Tier restriction
    if (error?.status === 429 || error?.code === 'rate_limit_exceeded' || error?.status === 403) {
      console.warn(`[GPT-5.5 LIMIT] ${primaryModel} limit reached. Auto-downgrading to ${fallbackModel}.`);
      
      try {
        const fallbackResponse = await client.chat.completions.create({
          model: fallbackModel,
          messages: [
            { role: "system", content: "You are a professional GNM assistant. (Running in Mini mode due to limit)" },
            { role: "user", content: prompt }
          ],
        });
        
        updateStatus("OpenAI", fallbackModel, "Connected (Downgraded)");
        return {
          content: fallbackResponse.choices[0].message.content || "",
          modelUsed: fallbackModel,
          downgraded: true
        };
      } catch (innerError: any) {
        updateStatus("OpenAI", fallbackModel, `Error ${innerError.status || "FAIL"}`, innerError.message);
        throw innerError;
      }
    }
    
    updateStatus("OpenAI", primaryModel, `Error ${error.status || "FAIL"}`, error.message);
    throw error;
  }
}
