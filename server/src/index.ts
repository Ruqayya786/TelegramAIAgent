import dotenv from "dotenv";
dotenv.config();
import { startBot } from "./bot";

startBot(); // yahi polling start karega

console.log("🤖 Telegram bot running...");
