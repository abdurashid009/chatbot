import React from "react";
import { useAuth } from "../components/useAuthContext";
import ChatUser from "../components/ChatUser.jsx";
import ChatAdmin from "../components/ChatAdmin.jsx";

const Service = () => {
  const { user } = useAuth();

  return (
    <div>
      {!user && (
        <p className="text-center mt-10">Iltimos, avval login qiling!</p>
      )}
          This service page
      {user && <>{user.role === "admin" ? <ChatAdmin /> : <ChatUser />}</>}
    </div>
  );
};

export default Service;
