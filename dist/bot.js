"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBot = startBot;
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const ollama_1 = require("./ollama");
const trainingdata_json_1 = __importDefault(require("./trainingdata.json"));
const trainingData = trainingdata_json_1.default;
function startBot() {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken)
        throw new Error("BOT_TOKEN missing in .env");
    const systemMessage = `
You are a friendly restaurant assistant.
- Highlight best deals and discounts.
- Mention taste, price, and how the customer saves.
- Encourage the customer politely to order.
- Only talk about food, drinks, desserts, and deals.
`;
    const bot = new node_telegram_bot_api_1.default(botToken, { polling: true });
    bot.on("message", async (msg) => {
        const chatId = msg.chat.id;
        const userText = msg.text?.toLowerCase();
        if (!userText)
            return;
        // Quick reply fallback
        const matched = trainingData.find(item => userText.includes(item.user.toLowerCase()));
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
            const reply = await (0, ollama_1.getOllamaReply)(userText, systemMessage, trainingData);
            setTimeout(() => {
                bot.sendMessage(chatId, reply);
            }, 1500);
        }
        catch (err) {
            console.error("Ollama Error:", err.message || err);
            bot.sendMessage(chatId, "⚠️ AI error occurred");
        }
    });
    return bot;
}
