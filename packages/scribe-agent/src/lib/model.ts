import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import type { LanguageModelV1 } from "ai";

// Provider-agnostic model factory.
// SCRIBE_MODEL_PROVIDER + SCRIBE_MODEL pick which provider+model to call.
// Adding a new provider = one case, one dep. Same pattern as AD-11 for embeddings.

const PROVIDER = (process.env.SCRIBE_MODEL_PROVIDER ?? "anthropic").toLowerCase();
const MODEL = process.env.SCRIBE_MODEL ?? defaultModelFor(PROVIDER);

function defaultModelFor(provider: string): string {
  switch (provider) {
    case "anthropic":
      return "claude-sonnet-4-6";
    case "openai":
      return "gpt-4o";
    case "google":
      return "gemini-1.5-pro";
    default:
      return "claude-sonnet-4-6";
  }
}

export function getScribeModel(): LanguageModelV1 {
  switch (PROVIDER) {
    case "anthropic":
      return anthropic(MODEL);
    case "openai":
      return openai(MODEL);
    case "google":
      return google(MODEL);
    default:
      throw new Error(
        `Unsupported SCRIBE_MODEL_PROVIDER='${PROVIDER}'. ` +
          `Supported: anthropic, openai, google. Add it in packages/scribe-agent/src/lib/model.ts.`,
      );
  }
}

export const SCRIBE_MODEL_DESCRIPTION = `${PROVIDER}/${MODEL}`;
