import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { BsCart3 } from "react-icons/bs";
import { FiSearch } from "react-icons/fi";
import { HiMenuAlt3, HiX } from "react-icons/hi";

const Navbar = () => {

  const [menuOpen, setMenuOpen] = useState(false)

  const navStyle = ({ isActive }) =>
    `transition duration-200 ${isActive
      ? "text-white font-semibold text-xl"
      : "text-gray-400 hover:text-white text-lg"
      }`;

  return (
    <>
      <div className="w-full min-h-20 bg-black/90 backdrop-blur-md sticky top-0 flex items-center justify-between px-4 md:px-8 rounded-b-2xl shadow-lg z-50">

        <div className="flex items-center gap-3 cursor-pointer py-4">

          <img
            src="https://cdn-icons-png.flaticon.com/512/5968/5968705.png"
            alt="logo"
            className="w-10 h-10 md:w-11 md:h-11 rounded-full"
          />

          <div className="hidden md:block leading-tight">
            <p className="text-white text-xl font-bold">
              DR. KENT
            </p>

            <p className="text-gray-300 text-xs tracking-[3px]">
              HOMOEOPHARMACY
            </p>
          </div>

        </div>

        <div className="hidden lg:flex items-center gap-8">

          <NavLink to="/" className={navStyle}>
            Home
          </NavLink>

          <NavLink to="/Labtest" className={navStyle}>
            Lab Test
          </NavLink>

          <NavLink to="/Consult" className={navStyle}>
            Consult Doctor
          </NavLink>

          <NavLink to="/Products" className={navStyle}>
            Products
          </NavLink>

          <NavLink to="/Contact" className={navStyle}>
            Contact Us
          </NavLink>

          <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-md">
            <input
              type="search"
              placeholder="Search medicines..."
              className="outline-none text-black w-32 xl:w-40"
            />
            <FiSearch className="text-gray-600 text-lg cursor-pointer" />
          </div>

          <NavLink
            to="/Cart"
            className="relative text-gray-300 hover:text-white transition"
          >
            <BsCart3 className="text-3xl" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
              2
            </span>
          </NavLink>

          <NavLink
            to="/Login"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition hover:scale-105"
          >
            Login / Sign Up
          </NavLink>

        </div>

        <div className="flex lg:hidden items-center gap-3">

          <div className="flex items-center bg-white rounded-full px-3 py-1.5 w-28 sm:w-36 transition-all duration-300 focus-within:w-44">
            <input
              type="search"
              placeholder="Search..."
              className="outline-none text-black text-sm w-full transition-all duration-300 focus:w-40 focus:text-base"
            />
            <FiSearch className="text-gray-500 text-sm" />
          </div>

          <NavLink
            to="/Cart"
            className="relative text-white"
          >
            <BsCart3 className="text-2xl" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
              2
            </span>
          </NavLink>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white text-4xl"
          >
            {
              menuOpen
                ?
                <HiX />
                :
                <HiMenuAlt3 />
            }
          </button>

        </div>

      </div>
      {
        menuOpen &&
        <div className="lg:hidden fixed top-20 left-0 w-full bg-black/90 backdrop-blur-md flex flex-col items-center gap-6 py-8 rounded-b-2xl shadow-xl z-40 cursor-pointer">

          <NavLink
            to="/"
            onClick={() => setMenuOpen(false)}
            className={navStyle}
          >
            Home
          </NavLink>

          <NavLink
            to="/Labtest"
            onClick={() => setMenuOpen(false)}
            className={navStyle}
          >
            Lab Test
          </NavLink>

          <NavLink
            to="/Consult"
            onClick={() => setMenuOpen(false)}
            className={navStyle}
          >
            Consult Doctor
          </NavLink>

          <NavLink
            to="/Products"
            onClick={() => setMenuOpen(false)}
            className={navStyle}
          >
            Products
          </NavLink>

          <NavLink
            to="/Contact"
            onClick={() => setMenuOpen(false)}
            className={navStyle}
          >
            Contact Us
          </NavLink>

          <NavLink
            to="/Login"
            onClick={() => setMenuOpen(false)}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Login / Sign Up
          </NavLink>

        </div>
      }

    </>
  )
}

export default Navbar