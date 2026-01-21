import TelegramBot, { Message } from "node-telegram-bot-api";
import dotenv from "dotenv";
import OpenAI from "openai";
import trainingDataRaw from "./trainingData.json";

dotenv.config();

// Type for JSON data
interface TrainingItem {
  user: string;
  bot: string;
}

const trainingData: TrainingItem[] = trainingDataRaw as TrainingItem[];

const botToken: string = process.env.BOT_TOKEN || "";
if (!botToken) throw new Error("BOT_TOKEN missing in .env");

// ✅ Safe polling with timeout
const bot = new TelegramBot(botToken, { polling: true });

const openaiApiKey: string = process.env.OPENAI_API_KEY || "";
if (!openaiApiKey) throw new Error("OPENAI_API_KEY missing in .env");
const openai = new OpenAI({ apiKey: openaiApiKey });

// System instructions
const systemMessage = `
You are a friendly restaurant assistant.
- Highlight best deals and discounts.
- Mention taste, price, and how the customer saves.
- Encourage the customer politely to order.
- Only talk about food, drinks, desserts, and deals.
`;

bot.on("message", async (msg: Message) => {
  const chatId: number = msg.chat.id;
  const userText: string | undefined = msg.text?.toLowerCase();

  if (!userText) return;

  // ✅ Quick reply from trainingData (instant)
  const matched = trainingData.find(item =>
    userText.includes(item.user.toLowerCase())
  );

  if (matched) {
    // Optional: small delay to look natural
    bot.sendChatAction(chatId, "typing");
    setTimeout(() => {
      bot.sendMessage(chatId, matched.bot);
    }, 800); // 0.8 second delay
    return;
  }

  // ✅ GPT-4o fallback with LATEM effect
  try {
    // Prepare messages for GPT
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system" as const, content: systemMessage },
      ...trainingData.flatMap(item => [
        { role: "user" as const, content: item.user },
        { role: "assistant" as const, content: item.bot }
      ]),
      { role: "user" as const, content: userText }
    ];

    bot.sendChatAction(chatId, "typing");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages
    });

    const reply = response.choices[0].message?.content || "Sorry, I didn't understand 😢";

    // LATEM effect: 1.5 seconds delay to look natural
    setTimeout(() => {
      bot.sendMessage(chatId, reply);
    }, 1500);

  } catch (error) {
    bot.sendMessage(chatId, "Sorry, kuch error ho gaya 😢");
    console.error(error);
  }
});

console.log(" Telegram GPT-4o Restaurant Bot with LATEM is running...");
