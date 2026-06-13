"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function identifyMedicineFromImage(base64Image: string) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY_MISSING");

  try {
    const genAI = new GoogleGenerativeAI(key);
    // Use flash for speed, but keep vision context
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Act as a clinical pharmacist. 
Scan this medical label/packaging and identify the primary medication.
Look for generic names (e.g., Paracetamol) or brand names (e.g., Emset).
If the image is blurry, try to infer based on visible characters.

ONLY return the name. NO other text.
If absolutely no medicine name is found, return 'NOT_FOUND'.`;

    const imageContent = {
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg",
      },
    };

    const result = await model.generateContent([prompt, imageContent]);
    const response = await result.response;
    const text = response.text().trim().replace(/[*#]/g, '');

    return {
      name: text !== "NOT_FOUND" ? text : null,
      error: false
    };
  } catch (error: any) {
    console.error("Vision Error:", error);
    return {
      error: true,
      message: "Vision engine offline."
    };
  }
}
