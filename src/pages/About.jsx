import React from "react";
import { useAuth } from "../components/useAuthContext";
import ChatUser from "../components/ChatUser.jsx";
import ChatAdmin from "../components/ChatAdmin.jsx";
import Spline from "@splinetool/react-spline";

const Home = () => {
  const { user } = useAuth();

  return (
    <div>
      {!user && (
        <p className="text-center mt-10">Iltimos, avval login qiling!</p>
      )}
      <div>
        <Spline className=" w-[100%] " scene="https://prod.spline.design/X7mgOlJ42nb9Zw29/scene.splinecode" />
      </div>
      {user && <>{user.role === "admin" ? <ChatAdmin /> : <ChatUser />}</>}
    </div>
  );
};

export default Home;
