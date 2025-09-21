import React from 'react'
import { Link } from 'react-router-dom'

const Sidebar = () => {
  return (
    <div>
      <div className="drawer lg:drawer-open h-full shadow-xl">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-center justify-center">
          {/* Page content here */}
          <label
            htmlFor="my-drawer-2"
            className="btn btn-primary drawer-button lg:hidden"
          >
            Open drawer
          </label>
        </div>
        <div className="drawer-side">
          <label
            htmlFor="my-drawer-2"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <ul className="menu bg-base-100 text-base-content min-h-full w-80 p-4">
            {/* Sidebar content here */}
            <li className=" text-succes hover:text-accent transition-transform duration-[0.5s] hover:scale-[1.05]">
              <Link to={"/"}>Home </Link>
            </li>
            <li className="text-succes hover:text-accent   transition-transform duration-[0.5s] hover:scale-[1.05]">
              <Link to={"/about"}>About </Link>
            </li>
            <li className="text-succes hover:text-accent   transition-transform duration-[0.5s] hover:scale-[1.05]">
              <Link to={"/service"}>Service </Link>
            </li>

            <li className="text-succes hover:text-accent   transition-transform duration-[0.5s] hover:scale-[1.05]">
              {" "}
              <Link to={"/contact"}>Contact</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Sidebar
