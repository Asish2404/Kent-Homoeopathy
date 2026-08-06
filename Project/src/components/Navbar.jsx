import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useCartContext } from "../Cart/CartContext";
import KentLogo from "../assets/Kent.png";

import { BsCart3 } from "react-icons/bs";
import { FiHeart, FiPhone } from "react-icons/fi";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import SearchBox from "./SearchBox";
import {
  FaUserCircle,
  FaUserMd,
  FaSignOutAlt,
  FaCog,
  FaLeaf,
} from "react-icons/fa";

import "./Navbar.css";


const Navbar = () => {



  const { totalCount, wishlistCount } = useCartContext();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Centralized auth state (admin + customer) backed by localStorage.
const readUser = () => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const user = readUser();
  const role = window.localStorage.getItem("role");
  const isAdmin = role === "admin";





  // Subtle shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

// Close profile dropdown on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navStyle = ({ isActive }) =>
    `navbarLink ${isActive ? "navbarLinkActive" : ""}`;


  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    setProfileOpen(false);
    setMenuOpen(false);
    navigate("/");
  };


  const handleWishlistOpen = () => {

    if (user) {
      navigate("/Profile", { state: { tab: "wishlist" } });
      return;
    }
    navigate("/Login", {
      state: { message: "Please login to continue." },
    });
  };

  const handleSearch = (value) => {
    const next = value.trim();
    if (!next) return;
    navigate(`/Products?query=${encodeURIComponent(next)}`);
    setMenuOpen(false);
  };

  return (
    <>
      {/* Announcement bar (subtle healthcare accent) */}
      <div className="w-full bg-[var(--brand-700)] text-white text-xs sm:text-sm py-2 px-4 text-center">
        <span className="inline-flex items-center gap-2">
          <FaLeaf className="text-[var(--brand-300)]" />
          Free delivery on orders above ₹499 · 100% Genuine Medicines
        </span>
      </div>

      {/* Navbar */}
      <div
        className={`w-full bg-[var(--neutral-900)]/95 backdrop-blur-md sticky top-0 z-50 transition-all duration-300
                    ${scrolled ? "shadow-xl py-2" : "shadow-md py-2"}`}
      >
        <div className="max-w-[1440px] mx-auto pl-3 xs:pl-4 sm:pl-6 lg:pl-6 pr-3 xs:pr-4 sm:pr-6 lg:pr-8">
<div className="flex items-center gap-2 sm:gap-3 w-full min-w-0">
            {/* Logo + Branding */}
            <button
              type="button"
              className="flex items-center gap-2 cursor-pointer group focus:outline-none flex-shrink-0 min-w-0"
              onClick={() => navigate("/")}
            >
<img
                src={KentLogo}
                alt="Kent Homoeopharmacy"
                className="bg-white w-10 h-10 lg:w-14 lg:h-14 rounded-md border border-white/20 shadow-lg shadow-[var(--brand-700)]/30 object-cover"
              />

              <div className="hidden lg:flex flex-col leading-none">
                <p className="text-white text-base sm:text-lg font-bold tracking-tight whitespace-nowrap">
                  DR. KENT
                </p>
                <p className="text-[var(--brand-300)] text-[11px] tracking-[3px] font-semibold whitespace-nowrap">
                  HOMOEO PHARMACY
                </p>
              </div>
            </button>

            {/* Shared universal search */}
            <div className="min-w-0 flex-1">
              <div className="w-full max-w-none lg:max-w-[320px] mx-auto min-w-0">
                <SearchBox
                  className="relative h-[40px] w-full min-w-0 bg-[#F8FAFC] rounded-[14px] border border-[#E5E7EB] shadow-sm transition-all duration-250 hover:border-[var(--brand-300)] focus-within:border-[var(--brand-500)] focus-within:shadow-[0_0_0_3px_rgba(34,197,94,0.15)]"
                  placeholder="Search medicines, doctors..."
                  ariaLabel="Universal Search"
                  onSearch={handleSearch}
                />
              </div>
            </div>


            {/* Desktop nav */}
            <div className="hidden lg:flex items-center justify-end gap-5 xl:gap-6 justify-self-end min-w-0">
{/* Navigation Links */}
              <div className="flex items-center gap-1 xl:gap-1.5">
                <NavLink to="/" className={navStyle} end>
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

                {/* Admin Dashboard must appear immediately before wishlist */}
                {isAdmin ? (
                  <NavLink to="/admin" className={navStyle}>
                    Admin Dashboard
                  </NavLink>
                ) : null}
              </div>

              {/* Action Icons + Profile */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Wishlist */}
                <button
                  type="button"
                  aria-label="Wishlist"
                  onClick={handleWishlistOpen}
                  className="navIconBtn"
                >
                  <FiHeart className="text-base" />

                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[var(--brand-500)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ring-2 ring-[var(--neutral-900)]">
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  )}
                </button>

                {/* Cart */}
                <NavLink
                  to="/Cart"
                  className="navIconBtn relative"
                >
                  <BsCart3 className="text-base" />

                  {totalCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[var(--brand-500)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ring-2 ring-[var(--neutral-900)]">
                      {totalCount > 99 ? "99+" : totalCount}
                    </span>
                  )}
                </NavLink>

                {/* User Profile / Login */}
                {user ? (
                  <div className="relative flex-shrink-0" ref={profileRef}>
                    <button
                      type="button"
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-2 cursor-pointer bg-white/10 hover:bg-white/15 pl-2 pr-3 py-1.5 rounded-full transition border border-white/10 whitespace-nowrap h-[44px]"
                    >
                      <img
                        src={`https://ui-avatars.com/api/?name=${user.user_name}&background=22c55e&color=fff&bold=true`}
                        alt="avatar"
                        className="w-8 h-8 rounded-full ring-2 ring-[var(--brand-400)] flex-shrink-0"
                      />

                      <div className="hidden sm:flex flex-col leading-tight">
                        <p className="text-white font-semibold text-sm leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[110px]">
                          {user.user_name}
                        </p>
                        <p className="text-[var(--brand-300)] text-[10px] tracking-wider whitespace-nowrap">
                          My Account
                        </p>
                      </div>
                    </button>

                    {profileOpen && (
                      <div
                        className="absolute top-14 right-0 w-72 bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-100 z-50 animate-fade-up"
                      >
                        <div className="flex flex-col items-center py-6 bg-gradient-to-br from-[var(--brand-500)] to-[var(--brand-700)]">
                          <img
                            src={`https://ui-avatars.com/api/?name=${user.user_name}&background=ffffff&color=16a34a&bold=true`}
                            alt="avatar"
                            className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                          />
                          <h3 className="mt-3 text-white font-bold text-lg">
                            {user.user_name}
                          </h3>
                          <p className="text-[var(--brand-100)] text-sm">
                            {user.email}
                          </p>
                        </div>

                        <div className="flex flex-col p-3 gap-1">
                          <NavLink
                            to="/Profile"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--brand-50)] text-neutral-700 transition"
                          >
                            <FaUserCircle className="text-[var(--brand-600)] text-lg" />
                            <span className="font-medium whitespace-nowrap">My Profile</span>
                          </NavLink>

                          <button
                            type="button"
                            onClick={() => {
                              navigate("/Profile", { state: { tab: "orders" } });
                              setProfileOpen(false);
                            }}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--brand-50)] text-neutral-700 transition text-left w-full"
                          >
                            <FaUserMd className="text-[var(--brand-600)] text-lg" />
                            <span className="font-medium whitespace-nowrap">My Orders</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              navigate("/Profile", { state: { tab: "wishlist" } });
                              setProfileOpen(false);
                            }}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--brand-50)] text-neutral-700 transition text-left w-full"
                          >
                            <FiHeart className="text-[var(--brand-600)] text-lg" />
                            <span className="font-medium whitespace-nowrap">Wishlist</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              navigate("/Profile", { state: { tab: "security" } });
                              setProfileOpen(false);
                            }}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--brand-50)] text-neutral-700 transition text-left w-full"
                          >
                            <FaCog className="text-[var(--brand-600)] text-lg" />
                            <span className="font-medium whitespace-nowrap">Settings</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              navigate("/Profile", { state: { tab: "appointments" } });
                              setProfileOpen(false);
                            }}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--brand-50)] text-neutral-700 transition text-left w-full"
                          >
                            <FaUserMd className="text-[var(--brand-600)] text-lg" />
                            <span className="font-medium whitespace-nowrap">
                              My Appointments
                            </span>
                          </button>

                          <div className="border-t border-neutral-100 my-1" />

                          <button
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 py-3 rounded-xl font-semibold transition mt-1"
                          >
                            <FaSignOutAlt />
                            <span className="whitespace-nowrap">Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  !isAdmin ? (
                    <NavLink
                      to="/Login"
                      className="btn-primary h-[44px] px-5 whitespace-nowrap text-sm rounded-xl flex items-center justify-center"
                    >
                      Login / Sign Up
                    </NavLink>
                  ) : null
                )}
              </div>
            </div>

            {/* Mobile right cluster */}
            <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 justify-self-end">
              <NavLink
                to="/Cart"
                className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                <BsCart3 className="text-xl" />
                {totalCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--brand-500)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ring-2 ring-[var(--neutral-900)]">
                    {totalCount > 99 ? "99+" : totalCount}
                  </span>
                )}
              </NavLink>

              <button
                type="button"
                onClick={handleWishlistOpen}
                className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-white"
                aria-label="Wishlist"
              >
                <FiHeart className="text-lg" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--brand-500)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ring-2 ring-[var(--neutral-900)]">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[var(--brand-600)] hover:bg-[var(--brand-700)] flex items-center justify-center text-white transition"
                aria-label="Toggle menu"
              >
                {menuOpen ? (
                  <HiX className="text-xl" />
                ) : (
                  <HiMenuAlt3 className="text-xl" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

{/* Mobile drawer menu */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition ${
          menuOpen ? "" : "pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMenuOpen(false)}
        />

{/* Drawer */}
        <div
          className={`mobile-drawer
                     bg-[var(--neutral-900)] shadow-2xl
                     flex flex-col
                     transition-transform duration-300 ease-out ${
                       menuOpen ? "translate-x-0" : "-translate-x-full"
                     }`}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <img
                src={KentLogo}
                alt="Kent"
                className="bg-white w-10 h-10 rounded-md object-cover"
              />
              <div className="leading-none">
                <p className="text-white font-bold text-sm tracking-tight">DR. KENT</p>
                <p className="text-[var(--brand-300)] text-[10px] tracking-[3px] font-semibold">
                  HOMOEO PHARMACY
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <HiX className="text-xl" />
            </button>
          </div>

          {/* Drawer content */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-1 px-4 py-4">
            {/* Mobile search (full width) */}
            <div className="w-full h-[44px] mb-3">
              <SearchBox
                className="relative h-full w-full bg-[#F8FAFC] rounded-[14px] border border-[#E5E7EB] shadow-sm transition-all duration-250 focus-within:border-[var(--brand-500)] focus-within:shadow-[0_0_0_3px_rgba(34,197,94,0.15)]"
                placeholder="Search medicines, doctors..."
                ariaLabel="Universal Search"
                onSearch={handleSearch}
              />
            </div>

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
              Book Appointment
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

            {/* Admin Dashboard inside hamburger only for admins */}
            {isAdmin ? (
              <NavLink
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className={navStyle}
              >
                Admin Dashboard
              </NavLink>
            ) : null}

            <a
              href="tel:08910863893"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white py-3 rounded-xl font-semibold transition"
            >
              <FiPhone />
              Call Us
            </a>

            {user ? (
              <div className="flex flex-col gap-3 mt-2 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${user.user_name}&background=22c55e&color=fff&bold=true`}
                    alt="avatar"
                    className="w-12 h-12 rounded-full ring-2 ring-[var(--brand-400)]"
                  />
                  <div className="min-w-0">
                    <p className="text-white font-semibold truncate">{user.user_name}</p>
                    <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
                  </div>
                </div>

                <NavLink
                  to={isAdmin ? "/admin" : "/Profile"}
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center btn-primary py-2.5"
                >
                  {isAdmin ? "My Account" : "My Profile"}
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-semibold transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              !isAdmin ? (
                <NavLink
                  to="/Login"
                  onClick={() => setMenuOpen(false)}
                  className="btn-primary py-3 mt-2 justify-center"
                >
                  Login / Sign Up
                </NavLink>
              ) : null
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;

