import React, { useState, useEffect, useRef } from "react";
import { IoSend } from "react-icons/io5";
import { useAuth } from "../components/useAuthContext";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Leaflet uchun default ikon sozlamalari
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const Service = () => {
  const { user, announces, addChatMessage } = useAuth();
  const [selectedAnnounce, setSelectedAnnounce] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  // Filtered va qidirilgan e'lonlarni olish
  const filteredAnnounces = announces.filter((announce) => {
    const matchesFilter = filter === "all" || announce.type === filter;
    const matchesSearch =
      announce.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announce.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  useEffect(() => {
    if (!selectedAnnounce || !user) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/messages?announceId=${selectedAnnounce.id}`
        );
        const data = await res.json();
        const filteredMessages = data.filter(
          (msg) => msg.announceId === selectedAnnounce.id
        );
        setMessages(
          filteredMessages.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          )
        );
      } catch (error) {
        console.error("Xabarlarni olishda xato:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [selectedAnnounce, user]);

  const sendMessage = async () => {
    if (!input.trim() || !selectedAnnounce || !user) return;
    await addChatMessage(selectedAnnounce.id, input);
    setInput("");
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const closeChat = () => {
    setSelectedAnnounce(null);
    setMessages([]);
  };

  if (!user)
    return <p className="text-center mt-10">Iltimos, avval login qiling!</p>;

  return (
    <div className="p-4 w-[1130px] bg-base-100 rounded-2xl">
      <h1 className="text-2xl font-bold mb-4 text-center">E'lonlar Chati</h1>

      {/* Qidiruv va Filter qismi */}
      <div className="mb-4 flex items-center flex-col gap-2">
        <div className="flex justify-center w-[1100px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="E'lon nomi yoki tavsifini qidiring..."
            className="flex-1 border border-primary rounded-xl p-2  w-full outline-none"
          />
        </div>
        <div className="flex gap-[55px]">
          <button
            onClick={() => setFilter("all")}
            className={`hover:scale-[1.1] active:scale-[0.9] transition-all duration-[0.5s] px-4 py-2 w-[330px] rounded-xl text-primary ${
              filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Barchasi
          </button>
          <button
            onClick={() => setFilter("lost")}
            className={`hover:scale-[1.1] active:scale-[0.9] transition-all duration-[0.5s] px-4 py-2 w-[330px] rounded-xl text-primary ${
              filter === "lost" ? "bg-red-500 text-white" : "bg-gray-200"
            }`}
          >
            Yo'qolganlar
          </button>
          <button
            onClick={() => setFilter("found")}
            className={`hover:scale-[1.1] active:scale-[0.9] transition-all duration-[0.5s] px-4 py-2 rounded-xl w-[330px] text-primary ${
              filter === "found" ? "bg-green-500 text-white" : "bg-gray-200"
            }`}
          >
            Topilganlar
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-screen">
        {/* E'lonlar ro'yxati */}
        <div className="lg:w-[700px] overflow-y-auto border border-primary rounded-xl shadow p-2">
          <h2 className="text-xl font-semibold mb-2">E'lonlar ro'yxati:</h2>
          {filteredAnnounces.length > 0 ? (
            filteredAnnounces.map((announce) => (
              <div
                key={announce.id}
                className="border w-[570px] bg-base-300 border-primary p-3 flex flex-col gap-1 rounded shadow mb-3"
              >
                <h3 className="text-lg font-bold">
                  {announce.title} (
                  {announce.type === "found" ? "Topib oldim" : "Yo'qotdim"})
                </h3>
                <p className="text-sm text-gray-600">
                  By: {announce.username} -{" "}
                  {new Date(announce.timestamp).toLocaleDateString()}
                </p>
                <p className="mt-1">{announce.description}</p>
                {announce.image && (
                  <img
                    src={announce.image}
                    alt="E'lon rasmi"
                    className="w-full h-32 object-cover mt-2 rounded"
                  />
                )}
                {announce.location && (
                  <div className="mt-2">
                    <p className="text-sm font-medium pb-[10px]">Lokatsiya:</p>
                    <div className="h-40 w-full rounded">
                      <MapContainer
                        center={announce.location} // [lat, lng] formatida
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                        className="rounded"
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker position={announce.location}>
                          <Popup>{announce.title}</Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setSelectedAnnounce(announce)}
                  className="mt-2 w-full btn rounded-xl hover:scale-[1.1] active:scale-[0.9] transition-all duration-[0.5s] btn-primary"
                >
                  Chatni ochish
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">
              Hech qanday e'lon topilmadi.
            </p>
          )}
        </div>

        {/* Chat paneli */}
        <div className="lg:w-1/2 border border-primary rounded-xl shadow p-4">
          {selectedAnnounce ? (
            <>
              <div className="flex justify-between  items-center mb-2">
                <h3 className="text-lg font-semibold">
                  Chat: {selectedAnnounce.title}
                </h3>
                <button
                  onClick={closeChat}
                  className="bg-red-500 px-[10px] py-0.5 rounded-full hover:bg-red-700"
                >
                  X
                </button>
              </div>
              <div className="h-80 overflow-y-auto border border-primary p-2 mb-2 bg-base-300 rounded-xl">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`mb-2 flex ${
                      msg.from === user.username
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-3 py-2 rounded-lg max-w-[80%] shadow ${
                        msg.from === user.username
                          ? "bg-blue-500 text-white"
                          : "bg-gray-300 text-black"
                      }`}
                    >
                      <div>{msg.text}</div>
                      <div className="text-xs mt-1 opacity-75">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Xabar yozing..."
                  className="flex-1 border p-2 rounded"
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button onClick={sendMessage} className="btn btn-success px-4">
                  <IoSend />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 mt-20">
              E'lon tanlang va chat oching.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Service;
