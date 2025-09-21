import React from "react";
import { useAuth } from "../components/useAuthContext";
import ChatUser from "../components/ChatUser.jsx";
import ChatAdmin from "../components/ChatAdmin.jsx";
import Spline from "@splinetool/react-spline";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className=" bg-linear-to-b p-0 via-purple-950 from-black to-black">
      {!user && (
        <p className="text-center mt-10">Iltimos, avval login qiling!</p>
      )}
      <h1 className=" md:text-2xl absolute z-50 top-[30%] left-[28%] lg:text-7xl font-mono">3D Home</h1>
      <div>
        {" "}
        <Spline
          className=" relative w-[600px]  lg:top-0"
          scene="https://prod.spline.design/LYq5xoMO56SGA6tI/scene.splinecode"
        />{" "}
      </div>
      {user && <>{user.role === "admin" ? <ChatAdmin /> : <ChatUser />}</>}
    </div>
  );
};

export default Home;
