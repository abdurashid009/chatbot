import React, { useState } from "react";
import { FaUserAlt } from "react-icons/fa";
import { useAuth } from "./useAuthContext";
import { RiAdminFill } from "react-icons/ri";
import { MdExitToApp } from "react-icons/md";
import { IoMoon } from "react-icons/io5";
import { IoIosLogIn } from "react-icons/io";
import { FaUserPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";


const Navbar = () => {
  const { user, login, register, logout, chooseRole, selectedRole } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="navbar bg-base-100 shadow-sm px-4">
      <div className="flex w-full items-center justify-between">
        <Link to="/">
          <h2 className="font-bold text-xl">My App</h2>
        </Link>
        <div className="flex items-center gap-4">
          <div className="dropdown">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-circle p-[5px] mr-[20px]"
            >
              <IoMoon className=" text-accent" />

              <svg
                width="12px"
                height="12px"
                className="inline-block h-2 w-2 fill-current opacity-60"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 2048 2048"
              >
                <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content bg-base-300 rounded-box z-1 w-52 relative left-[-90px] top-13 p-2 shadow-2xl"
            >
              <li>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller  btn btn-sm btn-block hover:bg-accent justify-start"
                  aria-label="Default"
                  value="default"
                />
              </li>
              <li>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller btn btn-sm btn-block hover:bg-accent justify-start"
                  aria-label="Retro"
                  value="retro"
                />
              </li>
              <li>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller btn btn-sm btn-block hover:bg-accent justify-start"
                  aria-label="Cyberpunk"
                  value="cyberpunk"
                />
              </li>
              <li>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller btn btn-sm btn-block hover:bg-accent justify-start"
                  aria-label="Valentine"
                  value="valentine"
                />
              </li>
              <li>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller btn btn-sm btn-block hover:bg-accent justify-start"
                  aria-label="Aqua"
                  value="aqua"
                />
              </li>
            </ul>
          </div>

          {!user && (
            <>
              <button
                className="btn btn-primary"
                onClick={() =>
                  document.getElementById("role_modal").showModal()
                }
              >
                Login
              </button>

              {/* Role tanlash modal */}
              <dialog id="role_modal" className="modal">
                <div className="modal-box">
                  <form method="dialog">
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                      ✕
                    </button>
                  </form>
                  <h3 className="font-bold text-lg mb-3">Rolni tanlang</h3>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-secondary rounded-[50px_0px_50px_0px] text-[17px] flex-1"
                      onClick={() => {
                        chooseRole("user");
                        document.getElementById("role_modal").close();
                        document.getElementById("login_modal").showModal();
                      }}
                    >
                      <FaUserAlt className="relative" />
                      Oddiy odam
                    </button>
                    <button
                      className="btn btn-accent rounded-[50px_0px_50px_0px] text-xl flex-1"
                      onClick={() => {
                        chooseRole("admin");
                        document.getElementById("role_modal").close();
                        document.getElementById("login_modal").showModal();
                      }}
                    >
                      <RiAdminFill className="text-2xl text" />
                      Admin
                    </button>
                  </div>
                </div>
              </dialog>

              {/* Login/Register modal */}
              <dialog id="login_modal" className="modal">
                <div className="modal-box">
                  <form method="dialog">
                      
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                      ✕
                    </button>
                  </form>
                  <h3 className="font-bold text-lg mb-3">
                    {selectedRole === "admin"
                      ? "Administration Login or Register"
                      : "User Login or Register"}
                  </h3>
                  <input
                    type="text"
                    placeholder={
                      selectedRole === "admin"
                        ? "Username"
                        : "Ismingizni kiriting"
                    }
                    className="input input-bordered w-full mb-2"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="input input-bordered w-full mb-3"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      className="btn btn-primary text-[16px] rounded-[50px_0px_50px_0px] flex-1"
                      onClick={(e) => {
                        e.preventDefault();
                        if (login(username, password)) {
                          setUsername("");
                          setPassword("");
                          document.getElementById("login_modal").close();
                        }
                      }}
                    >
                      Login <IoIosLogIn className=" text-2xl text-green-500" />
                    </button>
                    <button
                      className="btn btn-secondary text-[16px] rounded-[50px_0px_50px_0px] flex-1"
                      onClick={(e) => {
                        e.preventDefault();
                        if (register(username, password)) {
                          setUsername("");
                          setPassword("");
                          document.getElementById("login_modal").close();
                        }
                      }}
                    >
                      Register <FaUserPlus className=" text-2xl " />
                    </button>
                  </div>
                </div>
              </dialog>
            </>
          )}

          {/* Login bo‘lgan holat */}
          {user && (
            <div className="dropdown dropdown-end ">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle flex justify-center items-center avatar"
              >
                {user.role === "admin" ? (
                  <RiAdminFill className="text-2xl text-accent" />
                ) : (
                  <FaUserAlt className="relative" />
                )}
              </div>
              <ul className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-40 p-2 shadow">
                <li>
                  <a>
                    <RiAdminFill className=" text-accent text-xl" />
                    {user.username} ({user.role})
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                      window.location.href = "/";
                    }}
                  >
                    <MdExitToApp className=" text-xl text-error" />
                    Logout
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
