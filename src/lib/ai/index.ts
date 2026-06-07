import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// --- SYSTEM PROMPT ---
const NURSING_SYSTEM_PROMPT = `You are an expert nursing educator and study assistant for GNM (General Nursing and Midwifery) students.

Your primary mission is to help students understand complex medical concepts simply and pass their exams.

RULES:
1. Answer clearly, professionally, and with empathy.
2. For medical/nursing topics: act as an expert educator. Use structured explanations with headings and bullet points.
3. For non-nursing topics: provide normal, high-quality, helpful responses.
4. Response Length Logic:
   - If the user asks for a 'short' answer or uses keywords like 'define', 'briefly', 'what is', keep it under 100 words.
   - If the user asks for 'detail', 'explain', 'in depth', or 'exam answer', provide a comprehensive structured response.
5. Formatting: ALWAYS use Markdown (headings, bold, bullet points, tables where helpful).
6. Tone: Professional, encouraging, and academic.
7. Be concise: Never produce unnecessarily long encyclopedia-style responses unless asked for detail.`;

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
    provider: "Gemini",
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

/**
 * GEMINI 3.5 FLASH (Streaming + System Instructions)
 */
export async function* getGeminiStreamResponse(prompt: string) {
  const modelName = "gemini-3.5-flash"; 
  const key = process.env.GEMINI_API_KEY;
  
  if (!key) throw new Error("GEMINI_API_KEY_MISSING");

  try {
    const genAI = new GoogleGenerativeAI(key);
    
    // Detect intent for length optimization
    const lowerPrompt = prompt.toLowerCase();
    const isShortIntent = /define|what is|briefly|short|one line|who is/.test(lowerPrompt);
    const isDetailIntent = /explain|detail|in depth|exam|ncp|procedure/.test(lowerPrompt);
    
    let lengthInstruction = "";
    if (isShortIntent) lengthInstruction = "\n\n[INSTRUCTION: Keep this answer brief and under 100 words.]";
    if (isDetailIntent) lengthInstruction = "\n\n[INSTRUCTION: Provide a detailed, structured exam-style answer with headings.]";

    const model = genAI.getGenerativeModel({ 
      model: modelName, 
      safetySettings,
      systemInstruction: NURSING_SYSTEM_PROMPT // Native System Instruction support
    });
    
    const result = await model.generateContentStream(prompt + lengthInstruction);
    
    updateStatus(modelName, "Streaming Started");

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      yield chunkText;
    }
    
    updateStatus(modelName, "Connected (Stream Finished)");
  } catch (error: any) {
    updateStatus(modelName, `Error ${error.status || "FAIL"}`, error.message);
    throw error;
  }
}

// Legacy non-streaming support for simple UI calls (optional)
export async function getSimpleAIResponse(prompt: string) {
  const stream = getGeminiStreamResponse(prompt);
  let fullText = "";
  for await (const chunk of stream) {
    fullText += chunk;
  }
  return fullText;
}

// GPT removed as per request.
