// src/components/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // LocalStorage dan o‘qish
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // ❗ Alertlarni avtomatik yopish
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Role tanlash
  const chooseRole = (role) => {
    setSelectedRole(role);
  };

  // Login
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

  // Register
  const register = async (username, password) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // 🚫 Admin allaqachon mavjud bo‘lsa, qaytarib yuboramiz
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

    try {
      await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, role }),
      });
    } catch (e) {}

    return true;
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    window.location.reload();
  };

  // 🗑️ Faqat ADMIN uchun - barcha user va message o‘chirish
  const clearAllData = async () => {
    // LocalStorage dan o‘chirish
    localStorage.removeItem("users");
    localStorage.removeItem("messages");
    localStorage.removeItem("user");

    // db.json dagi users va messages ni DELETE qilish
    try {
      const [usersRes, messagesRes] = await Promise.all([
        fetch("http://localhost:3000/users"),
        fetch("http://localhost:3000/messages"),
      ]);
      const users = await usersRes.json();
      const messages = await messagesRes.json();

      // Barchasini o‘chiramiz
      await Promise.all([
        ...users.map((u) =>
          fetch(`http://localhost:3000/users/${u.id}`, { method: "DELETE" })
        ),
        ...messages.map((m) =>
          fetch(`http://localhost:3000/messages/${m.id}`, { method: "DELETE" })
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
        chooseRole,
        selectedRole,
        clearAllData,
      }}
    >
      {children}

      {/* Alertlar */}
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
