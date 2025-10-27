import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [announces, setAnnounces] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchAnnounces();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchAnnounces = async () => {
    try {
      const res = await fetch("http://localhost:3000/announces");
      const data = await res.json();
      setAnnounces(data);
    } catch (err) {
      console.error("E'lonlarni olishda xato:", err);
    }
  };

  const addAnnounce = async (title, description, type, image, location) => {
    let coordinates = null;
    if (location) {
      try {
        // Qisqa URL ni to'liq URL ga aylantirish uchun sinash
        const response = await fetch(
          `https://api.allorigins.win/get?url=${encodeURIComponent(location)}`
        );
        const data = await response.json();
        const fullUrl = data.contents; // To'liq URL ni olish uchun

        // To'liq URL dan koordinatalarni ajratib olish
        const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
        const match = fullUrl.match(regex);
        if (match) {
          coordinates = [parseFloat(match[1]), parseFloat(match[2])]; // [lat, lng]
        } else {
          setError(
            "❌ Noto'g'ri lokatsiya formati! Iltimos, Google Maps URL dan foydalaning."
          );
          return;
        }
      } catch (err) {
        setError("❌ Lokatsiya URL ni ishlab chiqishda xato: " + err.message);
        return;
      }
    }

    const newAnnounce = {
      id: Date.now(),
      title,
      description,
      type,
      username: user?.username,
      image: image || null,
      location: coordinates,
      timestamp: new Date().toISOString(),
    };
    try {
      await fetch("http://localhost:3000/announces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAnnounce),
      });
      setAnnounces((prev) => [...prev, newAnnounce]);
      setSuccess("✅ E'lon muvaffaqiyatli qo'shildi!");
    } catch (err) {
      setError("❌ E'lon qo'shishda xato!");
      console.error(err);
    }
  };

  const addChatMessage = async (announceId, text) => {
    const newMessage = {
      id: Date.now(),
      from: user?.username,
      text,
      timestamp: new Date().toISOString(),
      announceId,
    };
    try {
      await fetch("http://localhost:3000/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });
      setSuccess("✅ Xabar yuborildi!");
    } catch (err) {
      setError("❌ Xabar yuborishda xato!");
      console.error(err);
    }
  };

  const login = (username, password) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const role = selectedRole || "user";
    const existingUser = users.find(
      (u) =>
        u.username === username && u.password === password && u.role === role
    );
    if (existingUser) {
      setUser(existingUser);
      localStorage.setItem("user", JSON.stringify(existingUser));
      setSuccess("✅ Muvaffaqiyatli tizimga kirdingiz!");
      return true;
    } else {
      setError("❌ Login yoki parol xato!");
    }
    return false;
  };

  const register = async (username, password) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    if (selectedRole === "admin" && users.find((u) => u.role === "admin")) {
      setError("❌ Admin faqat bir marta ro‘yxatdan o‘tishi mumkin!");
      return false;
    }
    if (users.find((u) => u.username === username)) {
      setError("❌ Bu foydalanuvchi allaqachon mavjud!");
      return false;
    }
    const role = selectedRole || "user";
    const newUser = { username, password, role };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    setSuccess("✅ Ro‘yxatdan o‘tish muvaffaqiyatli!");
    await fetch("http://localhost:3000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, role }),
    });
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    window.location.reload();
  };

  const clearAllData = async () => {
    if (
      !window.confirm("Haqiqatan ham barcha ma'lumotlarni o'chirmoqchimisiz?")
    )
      return;
    localStorage.removeItem("users");
    localStorage.removeItem("messages");
    localStorage.removeItem("user");
    try {
      const [usersRes, messagesRes, announcesRes] = await Promise.all([
        fetch("http://localhost:3000/users"),
        fetch("http://localhost:3000/messages"),
        fetch("http://localhost:3000/announces"),
      ]);
      const users = await usersRes.json();
      const messages = await messagesRes.json();
      const announces = await announcesRes.json();
      await Promise.all([
        ...users.map((u) =>
          fetch(`http://localhost:3000/users/${u.id}`, { method: "DELETE" })
        ),
        ...messages.map((m) =>
          fetch(`http://localhost:3000/messages/${m.id}`, { method: "DELETE" })
        ),
        ...announces.map((a) =>
          fetch(`http://localhost:3000/announces/${a.id}`, { method: "DELETE" })
        ),
      ]);
    } catch (e) {
      console.error("db.json tozalashda xato:", e);
    }
    setSuccess("✅ Barcha ma'lumotlar tozalandi!");
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        chooseRole: (role) => setSelectedRole(role),
        selectedRole,
        clearAllData,
        announces,
        addAnnounce,
        addChatMessage,
      }}
    >
      {children}
      {error && (
        <div className="alert alert-error absolute z-999 top-5 right-[33%] w-96 shadow-lg">
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="alert alert-success absolute z-999 top-5 right-[33%] w-96 shadow-lg">
          <span>{success}</span>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export default AuthContext;
