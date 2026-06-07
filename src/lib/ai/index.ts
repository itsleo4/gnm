import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

const IS_DEV = process.env.NODE_ENV === "development";

// ─── Structured AI Error ────────────────────────────────────────────────────
export interface AIError {
  provider: "gemini" | "openai";
  status: "error";
  errorCode: string | number | null;
  errorMessage: string;
  devDetail?: string;
}

// ─── Logger ─────────────────────────────────────────────────────────────────
function logAIError(err: AIError) {
  const timestamp = new Date().toISOString();
  console.error(
    `\n[AI ERROR] ${timestamp}` +
    `\n  Provider   : ${err.provider.toUpperCase()}` +
    `\n  Status     : ${err.status}` +
    `\n  Error Code : ${err.errorCode ?? "N/A"}` +
    `\n  Message    : ${err.errorMessage}` +
    (err.devDetail ? `\n  Detail     : ${err.devDetail}` : "") +
    `\n`
  );
}

// ─── Gemini Client ───────────────────────────────────────────────────────────
const geminiApiKey = process.env.GEMINI_API_KEY;
const genAI = geminiApiKey
  ? new GoogleGenerativeAI(geminiApiKey)
  : null;

export const geminiModel = genAI
  ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  : null;

// ─── OpenAI Client ───────────────────────────────────────────────────────────
const openaiApiKey = process.env.OPENAI_API_KEY;
export const openai = openaiApiKey
  ? new OpenAI({ apiKey: openaiApiKey })
  : null;

// ─── Gemini: Simple AI Response ─────────────────────────────────────────────
export async function getSimpleAIResponse(prompt: string): Promise<string | AIError> {
  const provider = "gemini";

  if (!geminiApiKey) {
    const err: AIError = {
      provider,
      status: "error",
      errorCode: "MISSING_API_KEY",
      errorMessage: "Gemini API key is not configured.",
      devDetail: "Set GEMINI_API_KEY in your .env.local file.",
    };
    logAIError(err);
    return err;
  }

  if (!geminiModel) {
    const err: AIError = {
      provider,
      status: "error",
      errorCode: "INIT_FAILED",
      errorMessage: "Gemini client failed to initialize.",
    };
    logAIError(err);
    return err;
  }

  const requestStart = Date.now();
  console.log(`[AI REQUEST] Provider: GEMINI | Prompt length: ${prompt.length} chars`);

  try {
    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();
    console.log(`[AI SUCCESS] Provider: GEMINI | Duration: ${Date.now() - requestStart}ms | Response length: ${text.length} chars`);
    return text;
  } catch (error: any) {
    const errorCode = error?.status ?? error?.code ?? error?.errorDetails?.[0]?.reason ?? "UNKNOWN";
    const errorMessage = error?.message ?? "An unknown Gemini error occurred.";

    const err: AIError = {
      provider,
      status: "error",
      errorCode,
      errorMessage,
      devDetail: JSON.stringify(error, null, 2),
    };
    logAIError(err);
    return err;
  }
}

// ─── OpenAI: Complex AI Response ────────────────────────────────────────────
export async function getComplexAIResponse(prompt: string): Promise<string | AIError> {
  const provider = "openai";

  if (!openaiApiKey) {
    const err: AIError = {
      provider,
      status: "error",
      errorCode: "MISSING_API_KEY",
      errorMessage: "OpenAI API key is not configured.",
      devDetail: "Set OPENAI_API_KEY in your .env.local file.",
    };
    logAIError(err);
    return err;
  }

  if (!openai) {
    const err: AIError = {
      provider,
      status: "error",
      errorCode: "INIT_FAILED",
      errorMessage: "OpenAI client failed to initialize.",
    };
    logAIError(err);
    return err;
  }

  const requestStart = Date.now();
  console.log(`[AI REQUEST] Provider: OPENAI | Model: gpt-4-turbo | Prompt length: ${prompt.length} chars`);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0]?.message?.content;

    if (!text) {
      const err: AIError = {
        provider,
        status: "error",
        errorCode: "EMPTY_RESPONSE",
        errorMessage: "OpenAI returned an empty response.",
        devDetail: `Finish reason: ${response.choices[0]?.finish_reason}`,
      };
      logAIError(err);
      return err;
    }

    console.log(
      `[AI SUCCESS] Provider: OPENAI | Duration: ${Date.now() - requestStart}ms` +
      ` | Tokens used: ${response.usage?.total_tokens ?? "N/A"}` +
      ` | Response length: ${text.length} chars`
    );
    return text;
  } catch (error: any) {
    const errorCode = error?.status ?? error?.code ?? "UNKNOWN";
    const errorMessage = error?.message ?? "An unknown OpenAI error occurred.";

    const err: AIError = {
      provider,
      status: "error",
      errorCode,
      errorMessage,
      devDetail: JSON.stringify(
        { type: error?.type, param: error?.param, code: error?.code },
        null,
        2
      ),
    };
    logAIError(err);
    return err;
  }
}

// ─── Helper: Is it an AIError? ───────────────────────────────────────────────
export function isAIError(result: string | AIError): result is AIError {
  return typeof result === "object" && result.status === "error";
}

// ─── Helper: Format error for UI ────────────────────────────────────────────
export function formatAIError(err: AIError): string {
  if (IS_DEV) {
    return (
      `⚠️ [${err.provider.toUpperCase()} ERROR]\n` +
      `Code: ${err.errorCode}\n` +
      `Message: ${err.errorMessage}\n` +
      (err.devDetail ? `Detail: ${err.devDetail}` : "")
    );
  }
  // Production: generic but honest message per provider
  if (err.errorCode === "MISSING_API_KEY") {
    return "This AI feature is not currently available. Please try again later.";
  }
  if (err.errorCode === 429) {
    return "AI service is temporarily rate-limited. Please wait a moment and try again.";
  }
  if (String(err.errorCode).startsWith("5") || err.errorCode === "INIT_FAILED") {
    return "The AI service is experiencing issues. Please try again in a few minutes.";
  }
  return "Something went wrong with the AI response. Please try again.";
}
