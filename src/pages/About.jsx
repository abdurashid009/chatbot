import React, { useState } from "react";
import { useAuth } from "../components/useAuthContext";

const About = () => {
  const { user, addAnnounce } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [salary, setSalary] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!telegramUsername && !phoneNumber) {
      setError("Telegram username yoki telefon raqamidan kamida bittasi kerak!");
      return;
    }
    if (user && title && description) {
      try {
        // Save to JSON Server and broadcast to Telegram
        await addAnnounce(title, description, "job", image, location, salary, telegramUsername, phoneNumber);

        // Formani tozalash
        setTitle("");
        setDescription("");
        setSalary("");
        setTelegramUsername("");
        setPhoneNumber("");
        setImage(null);
        setLocation("");
        setError("");
      } catch (error) {
        console.error("E'lon qo'shishda xato:", error);
        setError("❌ E'lon yuborishda xato yuz berdi!");
      }
    }
  };

  if (!user)
    return <p className="text-center mt-10">Iltimos, avval login qiling!</p>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Yangi Ish E'lon Qo'shish</h1>
      {error && <p className="text-red-500 mb-2 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ish sarlavhasi (masalan: Frontend dasturchi kerak)"
          className="input input-bordered w-full bg-base-200"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ish tavsifi (tafsilotlar, talablar)"
          className="textarea textarea-bordered w-full bg-base-200"
        />
        <input
          type="text"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          placeholder="Maosh (masalan: 5000 000 so'm)"
          className="input input-bordered w-full bg-base-200"
        />
        <input
          type="text"
          value={telegramUsername}
          onChange={(e) => setTelegramUsername(e.target.value)}
          placeholder="Telegram username (masalan: @username)"
          className="input input-bordered w-full bg-base-200"
        />
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Telefon raqami (masalan: +998901234567)"
          className="input input-bordered w-full bg-base-200"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="file-input file-input-bordered w-full bg-base-200"
        />
        {image && (
          <img
            src={image}
            alt="Preview"
            className="w-32 h-32 object-cover mt-2 rounded-lg"
          />
        )}
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Lokatsiya (masalan: Toshkent, Mirzo Ulug'bek tumani)"
          className="input input-bordered w-full bg-base-200"
        />
        <button type="submit" className="btn btn-primary w-full hover:scale-105 transition-all">
          E'lonni yuborish
        </button>
      </form>
    </div>
  );
};

export default About;