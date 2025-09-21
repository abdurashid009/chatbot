import React, { useEffect, useState, useRef } from "react";
import { IoSend } from "react-icons/io5";
import { useAuth } from "./useAuthContext";
import { BiMessageRoundedDots } from "react-icons/bi";

const API_URL = "http://localhost:3000/messages"; // JSON Server
const BOT_URL = "http://localhost:5000/api/messages"; // Telegram Bot backend

const ChatUser = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Xabarlarni olish (polling)
  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();

        // Faqat user ↔ admin xabarlarini olish
        const filtered = data.filter(
          (msg) =>
            (msg.from === user.username && msg.to === "admin") ||
            (msg.from === "admin" && msg.to === user.username)
        );

        setMessages(filtered);
      } catch (err) {
        console.error("Xato (xabarlar):", err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 1500);
    return () => clearInterval(interval);
  }, [user]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    const newMsg = {
      from: user.username,
      to: "admin",
      text: input,
      timestamp: new Date().toISOString(),
    };
    try {
      // JSON serverga saqlash
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMsg),
      });

      // Telegram botga yuborish
      await fetch(BOT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMsg),
      });

      setMessages((prev) => [...prev, newMsg]);
      setInput("");
    } catch (err) {
      console.error("Xato (yuborish):", err);
    }
  };

  return (
    <div>
      <button
        className="btn btn-primary fixed bottom-5 right-5 py-[28px] rounded-full z-50"
        onClick={() => document.getElementById("my_modal_3").showModal()}
      >
        <BiMessageRoundedDots className=" text-2xl" />
      </button>

      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle hover:bg-red-500 absolute right-2 top-2">
              ✕
            </button>
          </form>
          <p className="py-4 absolute top-[-1px] hover:text-[17px] hover:text-red-500 transition-all duration-[0.5s]">
            Press ESC key or click on ✕ button to close
          </p>

          <div className="flex flex-col items-center w-full max-w-xl mx-auto mt-10">
            {/* Chat oynasi */}
            <div
              style={{
                backgroundImage: `url('/src/assets/Moon2.jpg')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              className="w-full h-[400px] overflow-y-auto rounded-xl shadow p-4 flex flex-col-reverse"
            >
              <div ref={messagesEndRef} />
              {messages.length > 0 ? (
                messages
                  .slice()
                  .reverse()
                  .map((msg, i) => (
                    <div
                      key={i}
                      className={`mb-2 flex ${
                        msg.from === user.username
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm shadow
                ${
                  msg.from === user.username
                    ? "rounded-[30px_30px_0_30px] border border-blue-500 bg-white/20 backdrop-blur-3xl text-white text-right"
                    : "rounded-[30px_30px_30px_0px] border border-emerald-500 bg-emerald-50/30 backdrop-blur-3xl text-white text-left"
                }`}
                      >
                        <div className="text-white">{msg.text}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-white text-center">Hali xabarlar yo‘q</div>
              )}
            </div>

            {/* Input va yuborish tugmasi */}
            <div className="flex w-full mt-4">
              <input
                className="flex-1 border border-blue-400 rounded-xl py-2 px-4"
                type="text"
                placeholder="Savolingizni bering"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                className="btn bg-green-400 ml-2 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-xl"
                onClick={sendMessage}
              >
                Send <IoSend />
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default ChatUser;
