"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOllamaReply = getOllamaReply;
const axios_1 = __importDefault(require("axios"));
async function getOllamaReply(userText, systemMessage, trainingData) {
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
    const response = await axios_1.default.post(`${ollamaUrl}/api/chat`, {
        model: ollamaModel,
        messages,
        stream: false
    });
    return response.data?.message?.content || "Sorry, I didn't understand 😢";
}
