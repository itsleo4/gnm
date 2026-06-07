import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import OpenAI from "openai";

// Safety settings for Gemini to allow academic medical/nursing content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

// Helper to get Gemini Model (Updated to most compatible ID)
function getGeminiModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY_NOT_FOUND");
  
  const genAI = new GoogleGenerativeAI(key);
  // Using 'gemini-1.5-flash' but forcing a fallback if the SDK is on an old beta
  return genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    safetySettings
  });
}

// Helper to get OpenAI Client (Updated to GPT-4o for better availability)
function getOpenAIClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY_NOT_FOUND");
  return new OpenAI({ apiKey: key });
}

export async function getSimpleAIResponse(prompt: string) {
  const startTime = Date.now();
  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    
    // If the standard model fails, we don't catch it here, it goes to the outer try/catch
    return result.response.text();
  } catch (error: any) {
    console.error(`[GEMINI ERROR DETAIL]`, error);
    // Fallback to gemini-pro if flash is not found in that API version
    if (error?.status === 404) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (innerError) {
        throw innerError;
      }
    }
    throw error;
  }
}

export async function getComplexAIResponse(prompt: string) {
  const startTime = Date.now();
  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o", // Upgraded from gpt-4-turbo for better compatibility/cost
      messages: [
        { 
          role: "system", 
          content: "You are a professional GNM (General Nursing and Midwifery) assistant. Provide accurate, academic, and practical nursing information." 
        },
        { role: "user", content: prompt }
      ],
    });

    return response.choices[0].message.content || "No response content.";
  } catch (error: any) {
    // If gpt-4o is also not found, try gpt-3.5-turbo as absolute fallback
    if (error?.status === 404) {
      const client = getOpenAIClient();
      const response = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });
      return response.choices[0].message.content || "No response content.";
    }
    throw error;
  }
}
