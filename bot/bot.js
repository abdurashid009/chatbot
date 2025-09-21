import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import express from "express";
import cors from "cors";

const TOKEN = "8490371064:AAHzO6hcGujzU2Ir0TpMHxj0vYM69ydfbf8";
const bot = new TelegramBot(TOKEN, { polling: true });

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = "../server/db.json";

// 🔹 Ma'lumotlar bazasini o'qish va yozish
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify({ users: [], messages: [] }, null, 2)
    );
  }
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// 🔹 Telegram userlarini saqlashfunction saveTelegramUser(chatId, userInfo) {
 function saveTelegramUser(chatId, userInfo) {
   const db = readDB();
   const telegramUsername = userInfo.username
     ? `@${userInfo.username}`
     : `telegram_${chatId}`;

   if (!db.users.some((u) => u.username === telegramUsername)) {
     const newUser = {
       id: `tg_${chatId}`,
       username: telegramUsername,
       role: "user",
       telegramInfo: {
         chatId,
         firstName: userInfo.first_name || "Telegram User",
         lastName: userInfo.last_name || "",
         telegramUsername: userInfo.username || "",
       },
     };
     db.users.push(newUser);
     writeDB(db);
     console.log(`✅ Yangi Telegram user qo'shildi: ${telegramUsername}`);
   }
 }

// 🔹 Botdan kelgan xabarlarni qayta ishlash
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const userInfo = msg.from;

  console.log(`📨 Telegram dan xabar keldi: ${text} (ChatID: ${chatId})`);

  // Telegram userini saqlash
  saveTelegramUser(chatId, userInfo);

  const db = readDB();
  const username = `telegram_${chatId}`;

  // Xabarni saqlash
  const newMsg = {
    id: `tgmsg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    from: username,
    to: "admin",
    text,
    timestamp: new Date().toISOString(),
    source: "telegram"
  };

  if (!db.messages.some((m) => m.id === newMsg.id)) {
    db.messages.push(newMsg);
    writeDB(db);
  }
});

// 🔹 Frontend uchun API endpoints
app.get("/api/messages", (req, res) => {
  try {
    const db = readDB();
    res.json(db.messages);
  } catch (error) {
    console.error("Messages olishda xato:", error);
    res.status(500).json({ error: "Server xatosi" });
  }
});

app.get("/api/users", (req, res) => {
  try {
    const db = readDB();
    res.json(db.users);
  } catch (error) {
    console.error("Users olishda xato:", error);
    res.status(500).json({ error: "Server xatosi" });
  }
});

// 🔹 Admindan Telegram userga xabar yuborish
app.post("/api/send-message", (req, res) => {
  const { to, text, from } = req.body;
  
  try {
    const db = readDB();

    // Agar Telegram user bo'lsa, botga yuborish
    if (to.startsWith("telegram_")) {
      const chatId = to.split("_")[1];
      
      bot.sendMessage(chatId, `💬 Admin javobi:\n\n${text}`)
        .then(() => {
          console.log(`✅ Telegram ga yuborildi: ${chatId}`);
        })
        .catch((error) => {
          console.error("Telegram ga yuborishda xato:", error);
        });
    }

    // Xabarni ma'lumotlar bazasiga saqlash
    const newMsg = {
      id: `adm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from: from || "admin",
      to,
      text,
      timestamp: new Date().toISOString(),
      source: "admin"
    };
    
    db.messages.push(newMsg);
    writeDB(db);
    
    res.json({ success: true, message: "Xabar yuborildi" });
  } catch (error) {
    console.error("Xabar yuborishda xato:", error);
    res.status(500).json({ error: "Xabar yuborishda xato" });
  }
});

// 🔹 Bot serverni ishga tushirish (port 5001 da)
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🤖 Telegram Bot Backend ishlamoqda: http://localhost:${PORT}`);
  console.log(`📱 Bot polling boshlandi...`);
});

// 🔹 Bot xatoliklarini tutish
bot.on("error", (error) => {
  console.error("Bot xatosi:", error);
});

bot.on("polling_error", (error) => {
  console.error("Polling xatosi:", error);
});