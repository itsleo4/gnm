import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// Standard Free-Tier Gemini Integration
export async function getSimpleAIResponse(prompt: string) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

// Standard Free-Tier ChatGPT (GPT-4o) Integration
export async function getComplexAIResponse(prompt: string) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
}
