import React, { useEffect, useState, useRef } from "react";
import { IoSend } from "react-icons/io5";
import { useAuth } from "./useAuthContext";
import { BiMessageRoundedDots } from "react-icons/bi";
import { AiOutlineClear } from "react-icons/ai";
import Chat from "../assets/Chat.png";

const API_URL = "http://localhost:3000/messages"; // JSON Server
const USERS_URL = "http://localhost:3000/users";
const BOT_API_URL = "http://localhost:5001/api"; // Telegram Bot backend

const ChatAdmin = () => {
  const { user: admin } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const messagesEndRef = useRef(null);

  // Foydalanuvchilarni olish (JSON Server + Telegram Bot)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // 1️⃣ JSON Server dan userlar
        const jsonServerRes = await fetch(USERS_URL);
        let jsonServerUsers = [];
        if (jsonServerRes.ok) {
          jsonServerUsers = await jsonServerRes.json();
        }

        // 2️⃣ Telegram Bot dan userlar
        const botRes = await fetch(`${BOT_API_URL}/users`);
        let botUsers = [];
        if (botRes.ok) {
          botUsers = await botRes.json();
        }

        // 3️⃣ Barcha userlarni birlashtirish va admin userlarni olib tashlash
        const allUsers = [...jsonServerUsers, ...botUsers];
        const nonAdminUsers = allUsers.filter((u) => u.role !== "admin");

        // 4️⃣ Duplicate userlarni olib tashlash
        const uniqueUsers = Array.from(
          new Map(nonAdminUsers.map((u) => [u.username, u])).values()
        );

        setUsers(uniqueUsers);
        console.log("👥 Foydalanuvchilar yuklandi:", uniqueUsers);
      } catch (error) {
        console.error("Foydalanuvchilarni olishda xato:", error);
      }
    };

    fetchUsers();
    const interval = setInterval(fetchUsers, 3000); // Har 3 soniyada yangilanadi
    return () => clearInterval(interval);
  }, []);

  // Xabarlarni olish
  useEffect(() => {
    if (!selectedUser || !admin) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        // 1️⃣ JSON Server dan xabarlar
        const jsonServerRes = await fetch(API_URL);
        let jsonServerMessages = [];
        if (jsonServerRes.ok) {
          jsonServerMessages = await jsonServerRes.json();
        }

        // 2️⃣ Telegram Bot dan xabarlar
        const botRes = await fetch(`${BOT_API_URL}/messages`);
        let botMessages = [];
        if (botRes.ok) {
          botMessages = await botRes.json();
        }

        // 3️⃣ Barcha xabarlarni birlashtirish
        const allMessages = [...jsonServerMessages, ...botMessages];

        // 4️⃣ Faqat tanlangan user bilan xabarlarni filtrlash
        const filtered = allMessages.filter((msg) => {
          const isFromAdminToSelectedUser =
            msg.from === admin.username && msg.to === selectedUser.username;
          const isFromSelectedUserToAdmin =
            msg.from === selectedUser.username && msg.to === admin.username;

          return isFromAdminToSelectedUser || isFromSelectedUserToAdmin;
        });

        // 5️⃣ Vaqt bo'yicha tartiblash
        const sorted = filtered.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
        setMessages(sorted);
      } catch (error) {
        console.error("Xabarlarni olishda xato:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000); // Har 2 soniyada yangilanadi
    return () => clearInterval(interval);
  }, [selectedUser, admin]);

  // Xabar yuborish
  const sendMessage = async () => {
    if (!input.trim() || !selectedUser || !admin) return;

    const newMsg = {
      from: admin.username,
      to: selectedUser.username,
      text: input,
      timestamp: new Date().toISOString(),
    };

    try {
      // 1️⃣ JSON Server ga saqlash
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMsg),
      });

      // 2️⃣ Agar Telegram user bo'lsa, botga yuborish
      if (selectedUser.username.startsWith("telegram_")) {
        await fetch(`${BOT_API_URL}/send-message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: selectedUser.username,
            text: input,
            from: admin.username,
          }),
        });
      }

      setMessages((prev) => [...prev, newMsg]);
      setInput("");
      console.log("✅ Xabar yuborildi:", newMsg);
    } catch (error) {
      console.error("Xabar yuborishda xato:", error);
    }
  };

  // Barcha ma'lumotlarni tozalash
  const clearAllData = async () => {
    if (
      !window.confirm("Haqiqatan ham barcha ma'lumotlarni o'chirmoqchimisiz?")
    )
      return;

    localStorage.clear();

    try {
      const [usersRes, messagesRes] = await Promise.all([
        fetch(USERS_URL),
        fetch(API_URL),
      ]);

      if (usersRes.ok && messagesRes.ok) {
        const usersData = await usersRes.json();
        const messagesData = await messagesRes.json();

        for (const u of usersData) {
          await fetch(`${USERS_URL}/${u.id}`, { method: "DELETE" });
        }
        for (const m of messagesData) {
          await fetch(`${API_URL}/${m.id}`, { method: "DELETE" });
        }
      }

      alert("✅ Barcha ma'lumotlar o'chirildi!");
      window.location.reload();
    } catch (err) {
      console.error("O'chirishda xato:", err);
    }
  };

  return (
    <div>
      {/* Clear tugmasi */}
      {admin?.role === "admin" && (
        <button
          onClick={clearAllData}
          className="hover:scale-[1.2] transition-all animate-bounce duration-[0.5s] fixed z-50 bottom-22 right-5 bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-4 rounded-[50%] shadow"
        >
          <AiOutlineClear className="text-2xl" />
        </button>
      )}

      {/* Chat tugmalari */}
      <button
        className="btn btn-primary animate-bounce fixed bottom-5 hover:scale-[1.2] transition-all duration-[0.5s] right-5 py-[28px] rounded-full z-50"
        onClick={() => document.getElementById("my_modal_3").showModal()}
      >
        <BiMessageRoundedDots className="text-2xl" />
      </button>

      <button
        className="animate-bounce fixed bottom-39 hover:scale-[1.2] transition-all duration-[0.5s] right-5 rounded-full z-50"
        onClick={() => document.getElementById("my_modal_4").showModal()}
      >
        <img className="w-[55px]" src={Chat} alt="" />
      </button>

      {/* Savol modal */}
      <dialog id="my_modal_4" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <div className="flex items-center gap-5">
            <img className="w-[65px]" src={Chat} alt="" />
            <h1 className="text-xl">Salom, Sizga qanday yordam bera olaman</h1>
          </div>
        </div>
      </dialog>

      {/* Chat modal */}
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box h-[85%]">
          <form method="dialog">
            <button className="btn btn-sm btn-circle hover:bg-red-500 absolute right-2 top-2">
              ✕
            </button>
          </form>

          {/* Foydalanuvchilar ro'yxati */}
          <div className="flex flex-col items-center w-full max-w-xl mx-auto mt-10">
            <div className="mb-4 w-full h-[55%] p-[10px] flex gap-2 overflow-x-auto">
              {users.length > 0 ? (
                users.map((u) => (
                  <button
                    key={u.username}
                    className={`px-3 py-1 rounded-[16px] hover:scale-[1.1] active:scale-[0.8] transition-all duration-[0.5s] hover:bg-green-500 hover:text-white whitespace-nowrap ${
                      selectedUser?.username === u.username
                        ? "bg-blue-500 text-white animate-bounce hover:animate-none"
                        : "bg-white text-black animate-bounce hover:animate-none"
                    }`}
                    onClick={() => setSelectedUser(u)}
                  >
                    {u.telegramInfo && u.telegramInfo.telegramUsername
                      ? `@${u.telegramInfo.telegramUsername}`
                      : u.username.startsWith("telegram_")
                      ? `TG-${u.username.replace("telegram_", "")}`
                      : `👤 ${u.username}`}
                  </button>
                ))
              ) : (
                <div className="text-gray-500">Foydalanuvchilar topilmadi</div>
              )}
            </div>

            {/* Chat oynasi */}
            <div
              style={{
                backgroundImage: `url('/src/assets/Moon2.jpg')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              className="w-full h-[330px] overflow-y-auto rounded-xl shadow p-4 flex flex-col"
            >
              {selectedUser ? (
                messages.length > 0 ? (
                  messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`mb-2 flex ${
                        msg.from === admin?.username
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm shadow ${
                          msg.from === admin?.username
                            ? "rounded-[30px_30px_0_30px] border border-blue-500 bg-white/20 backdrop-blur-3xl text-white text-right"
                            : "rounded-[30px_30px_30px_0px] border border-emerald-500 bg-emerald-50/30 backdrop-blur-3xl text-white text-left"
                        }`}
                      >
                        <div className="text-white">{msg.text}</div>
                        <div className="text-xs text-gray-300 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                          {msg.source === "telegram" && " 📱"}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-white text-center">
                    {selectedUser.username.startsWith("telegram_")
                      ? "Telegram foydalanuvchisi bilan xabarlar yo'q"
                      : "Ushbu foydalanuvchi bilan xabarlar yo'q"}
                  </div>
                )
              ) : (
                <div className="text-white text-center">
                  Foydalanuvchini tanlang
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex w-full mt-4">
              <input
                className="flex-1 border border-blue-500 outline-none rounded-xl py-2 px-4 bg-white/30 text-white placeholder-white"
                type="text"
                placeholder={
                  selectedUser
                    ? selectedUser.username.startsWith("telegram_")
                      ? "Telegram foydalanuvchisiga javob yozing..."
                      : "Javobingizni yozing..."
                    : "Foydalanuvchini tanlang"
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                disabled={!selectedUser}
              />
              <button
                className="btn bg-green-400 ml-2 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-xl"
                onClick={sendMessage}
                disabled={!selectedUser}
              >
                Yuborish <IoSend />
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default ChatAdmin;
