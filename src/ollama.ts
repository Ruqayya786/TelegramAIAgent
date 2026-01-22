import axios from "axios";

interface TrainingItem {
  user: string;
  bot: string;
}

export async function getOllamaReply(
  userText: string,
  systemMessage: string,
  trainingData: TrainingItem[]
): Promise<string> {
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const ollamaModel = process.env.OLLAMA_MODEL || "llama3";

  const messages = [
    { role: "system", content: systemMessage },
    ...trainingData.flatMap(item => [
      { role: "user", content: item.user },
      { role: "assistant", content: item.bot }
    ]),
    { role: "user", content: userText }
  ];

  const response = await axios.post(`${ollamaUrl}/api/chat`, {
    model: ollamaModel,
    messages,
    stream: false
  });

  return response.data?.message?.content || "Sorry, I didn't understand 😢";
}
