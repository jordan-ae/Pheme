import { embed } from "ai";
import { openai } from "@ai-sdk/openai";

const PROVIDER = process.env.MEMORY_EMBEDDING_PROVIDER ?? "openai";
const MODEL = process.env.MEMORY_EMBEDDING_MODEL ?? "text-embedding-3-small";
const DIMS = Number.parseInt(process.env.MEMORY_EMBEDDING_DIMENSIONS ?? "1536", 10);

export const EMBEDDING_DIMENSIONS = DIMS;

function getEmbeddingModel() {
  switch (PROVIDER) {
    case "openai":
      // OpenAI text-embedding-3-* support Matryoshka truncation via `dimensions`.
      return openai.embedding(MODEL, { dimensions: DIMS });
    default:
      throw new Error(
        `Unsupported MEMORY_EMBEDDING_PROVIDER='${PROVIDER}'. ` +
          `Add the provider to packages/memory-server/src/lib/embedding.ts.`,
      );
  }
}

export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: getEmbeddingModel(),
    value: text,
  });

  if (embedding.length !== DIMS) {
    throw new Error(
      `Embedding dimension mismatch: expected ${DIMS}, got ${embedding.length}. ` +
        `Check MEMORY_EMBEDDING_MODEL is compatible with MEMORY_EMBEDDING_DIMENSIONS.`,
    );
  }
  return embedding;
}
