import TelegramBot, { Message } from "node-telegram-bot-api";
import { getOllamaReply } from "./ollama";
import trainingDataRaw from "./trainingdata.json";

interface TrainingItem {
  user: string;
  bot: string;
}

const trainingData: TrainingItem[] = trainingDataRaw as TrainingItem[];

export function startBot() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) throw new Error("BOT_TOKEN missing in .env");

  const systemMessage = `
You are a friendly restaurant assistant.
- Highlight best deals and discounts.
- Mention taste, price, and how the customer saves.
- Encourage the customer politely to order.
- Only talk about food, drinks, desserts, and deals.
`;

  const bot = new TelegramBot(botToken, { polling: true });

  bot.on("message", async (msg: Message) => {
    const chatId = msg.chat.id;
    const userText = msg.text?.toLowerCase();
    if (!userText) return;

    // Quick reply fallback
    const matched = trainingData.find(item =>
      userText.includes(item.user.toLowerCase())
    );

    if (matched) {
      bot.sendChatAction(chatId, "typing");
      setTimeout(() => {
        bot.sendMessage(chatId, matched.bot);
      }, 800);
      return;
    }

    // Ollama API fallback
    bot.sendChatAction(chatId, "typing");
    try {
      const reply = await getOllamaReply(userText, systemMessage, trainingData);
      setTimeout(() => {
        bot.sendMessage(chatId, reply);
      }, 1500);
    } catch (err: any) {
      console.error("Ollama Error:", err.message || err);
      bot.sendMessage(chatId, "⚠️ AI error occurred");
    }
  });

  return bot;
}
