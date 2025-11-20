"use client";

import { useState } from "react";
import type { GeminiPromptType } from "@/lib/gemini";

interface UseAIOptions {
  type: GeminiPromptType;
  context: Record<string, unknown>;
}

interface UseAIResult {
  generate: () => Promise<void>;
  text: string | null;
  loading: boolean;
  error: string | null;
  isFallback: boolean;
}

/**
 * React hook for AI content generation
 */
export function useAI(options: UseAIOptions): UseAIResult {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: options.type,
          context: options.context,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setText(data.text);
      setIsFallback(data.fallback || false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate content";
      setError(errorMessage);
      console.error("AI generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    generate,
    text,
    loading,
    error,
    isFallback,
  };
}
