import React, { useState } from "react";
import { useAuth } from "../components/useAuthContext";

const About = () => {
  const { user, addAnnounce } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("found");
  const [image, setImage] = useState(null); // base64 rasm
  const [location, setLocation] = useState(""); // Lokatsiya (masalan, "Toshkent, Mirzo Ulug'bek tumani")

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // base64 format
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user && title && description) {
      addAnnounce(title, description, type, image, location);
      setTitle("");
      setDescription("");
      setImage(null);
      setLocation("");
    }
  };

  if (!user)
    return <p className="text-center mt-10">Iltimos, avval login qiling!</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Yangi E'lon Qo'shish</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sarlavha (masalan: Kalit topdim)"
          className="input input-bordered w-full"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tavsif (joy, vaqt, tafsilotlar)"
          className="textarea textarea-bordered w-full"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="select select-bordered w-full"
        >
          <option value="found">Topib oldim</option>
          <option value="lost">Yo'qotdim</option>
        </select>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="file-input file-input-bordered w-full"
        />
        {image && (
          <img
            src={image}
            alt="Preview"
            className="w-32 h-32 object-cover mt-2"
          />
        )}
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Lokatsiya (masalan: Toshkent, Mirzo Ulug'bek tumani)"
          className="input input-bordered w-full"
        />
        <button type="submit" className="btn btn-primary w-full">
          E'lonni yuborish
        </button>
      </form>
    </div>
  );
};

export default About;
