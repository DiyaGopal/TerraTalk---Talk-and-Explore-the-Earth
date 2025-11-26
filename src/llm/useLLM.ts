// src/llm/useLLM.ts

import { useState } from "react";
import { interpretSpeech } from "./llmService";

/**
 * React hook for LLM command interface.
 */
export function useLLM() {
  const [loading, setLoading] = useState(false);
  const [lastCommand, setLastCommand] = useState<any>(null);

  const askLLM = async (utterance: string) => {
    setLoading(true);
    try {
      const command = await interpretSpeech(utterance);
      setLastCommand(command);
      return command;
    } finally {
      setLoading(false);
    }
  };

  return { askLLM, loading, lastCommand };
}
