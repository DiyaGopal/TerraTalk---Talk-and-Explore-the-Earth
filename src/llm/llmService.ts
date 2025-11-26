// src/llm/llmService.ts
export async function interpretSpeech(text: string): Promise<any> {
  const prompt = (await import("../llm/geoTools")).createPrompt(text);
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma3:1b', // check actual model name via 'ollama list'
        prompt: `Respond with valid JSON only:\n${prompt}\nJSON:`,
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 100,
          top_p: 0.9,
          stop: ["\n\n"]
        }
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const result = await response.json();

    // Extract the response text
    const content = result.response?.trim();
    if (!content) throw new Error("Empty response");

    // Parse to JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Invalid JSON format");
    }
  } catch (err) {
    console.error("LLM parsing error:", err);
    return {
      command: "error",
      message: "Failed to interpret command",
      success: false
    };
  }
}
