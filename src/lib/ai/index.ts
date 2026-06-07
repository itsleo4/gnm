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
  try {
    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I'm having trouble connecting to my brain right now.";
  }
}

export async function getComplexAIResponse(prompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0].message.content || "I couldn't process that complex request.";
  } catch (error) {
    console.error("OpenAI Error:", error);
    return "My advanced logic circuits are briefly offline.";
  }
}
