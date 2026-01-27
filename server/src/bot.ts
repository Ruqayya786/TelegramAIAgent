import TelegramBot, { Message } from "node-telegram-bot-api";
import { getOllamaReply } from "./ollama";
import trainingDataRaw from "./trainingdata.json";
import { MongoClient, Db } from "mongodb";

interface TrainingItem {
  user: string;
  bot: string;
}

const trainingData: TrainingItem[] = trainingDataRaw as TrainingItem[];
const lastReplyMap = new Map<number, string>();

// ----------------- MongoDB Setup -----------------
const mongoUri = process.env.MONGO_URI!;
const dbName = process.env.DB_NAME!;
let db: Db;
const client = new MongoClient(mongoUri); // ✅ No useNewUrlParser needed

async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB!");
    db = client.db(dbName);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}
// ------------------------------------------------

export async function startBot() {
  await connectDB(); // Connect to DB before starting the bot

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) throw new Error("BOT_TOKEN missing in .env");

  const systemMessage = `
You are a smart Pakistani restaurant assistant.
- Do NOT repeat the same reply again and again.
- Understand what the user is asking.
- If user selects an item, ask for quantity.
- If user repeats item name, guide politely.
- Talk only about food, deals, prices, and orders.
`;

  const bot = new TelegramBot(botToken, { polling: true });
  console.log("🤖 Telegram bot started and polling...");

  bot.on("message", async (msg: Message) => {
    const chatId = msg.chat.id;
    const userText = msg.text?.toLowerCase().trim();
    if (!userText) return;

    console.log(`📩 Received message from ${chatId}: ${userText}`);

    // ---------------- Save message to MongoDB ----------------
    if (db) {
      try {
        const messagesCollection = db.collection("messages");
        await messagesCollection.insertOne({
          chatId,
          userText,
          date: new Date(),
        });
        console.log(`✅ Saved message from ${chatId} to MongoDB`);
      } catch (err: any) {
        console.error("MongoDB Insert Error:", err.message || err);
      }
    }
    // ---------------------------------------------------------

    // 🟢 BASIC GREETING HANDLE
    if (["hi", "hello", "assalam", "assalamualaikum"].includes(userText)) {
      bot.sendMessage(
        chatId,
        "Assalam-o-Alaikum! 😊 Welcome to Foodie Hub."
      );
      return;
    }

    // 🟢 ORDER CONFIRM FLOW
    if (userText.includes("order") || userText.includes("confirm")) {
      bot.sendMessage(
        chatId,
        "Perfect 👍 Item ka naam aur quantity bata dein (jaise: 1 Alfredo pasta)."
      );
      return;
    }

    if (["pasta", "burger", "pizza"].includes(userText)) {
      bot.sendMessage(
        chatId,
        `Zabardast choice 😋 Bataein kaunsa ${userText} aur kitni quantity order karni hai?`
      );
      return;
    }

    // 🟡 TRAINING DATA MATCH (SMART)
    const matched = trainingData.find(item =>
      userText.includes(item.user.toLowerCase())
    );

    if (matched) {
      const lastReply = lastReplyMap.get(chatId);

      if (lastReply === matched.bot) {
        bot.sendMessage(
          chatId,
          "Samajh gaya 👍 Ab quantity bata dein ya order confirm karein."
        );
        return;
      }

      bot.sendChatAction(chatId, "typing");
      setTimeout(() => {
        bot.sendMessage(chatId, matched.bot);
        lastReplyMap.set(chatId, matched.bot);
        console.log(`💬 Sent training reply to ${chatId}: ${matched.bot}`);
      }, 700);

      return;
    }

    // 🔵 AI FALLBACK (jab training ka jawab na mile)
    bot.sendChatAction(chatId, "typing");
    try {
      const reply = await getOllamaReply(userText, systemMessage, trainingData);
      setTimeout(() => {
        bot.sendMessage(chatId, reply);
        lastReplyMap.set(chatId, reply);
        console.log(`💬 Sent AI reply to ${chatId}: ${reply}`);
      }, 1200);
    } catch (err: any) {
      console.error("Ollama Error:", err.message || err);
      bot.sendMessage(chatId, "Something Went Wrong.");
    }
  });

  return bot;
}
