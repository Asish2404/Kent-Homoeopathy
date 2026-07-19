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
  const [query, setQuery] = useState("");
  void query;

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
    setQuery(value);
    if (!next) return;
    navigate(`/Products?query=${encodeURIComponent(next)}`);
    setMenuOpen(false);
  };

  void handleSearch;

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
        <div className="max-w-[1400px] mx-auto px-2 xs:px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-1.5 sm:gap-3 w-full flex-nowrap">
            {/* Logo + Branding */}
            <button
              type="button"
              className="flex items-center gap-2 cursor-pointer group focus:outline-none flex-shrink-0 min-w-0"
              onClick={() => navigate("/")}
            >
              <img
                src={KentLogo}
                alt="Kent Homoeopharmacy"
                className="bg-white w-12 h-12 sm:w-14 sm:h-14 rounded-md border border-white/20 shadow-lg shadow-[var(--brand-700)]/30 object-cover"
              />

              <div className="hidden sm:flex flex-col leading-none">
                <p className="text-white text-base sm:text-lg font-bold tracking-tight whitespace-nowrap">
                  DR. KENT
                </p>
                <p className="text-[var(--brand-300)] text-[11px] tracking-[3px] font-semibold whitespace-nowrap">
                  HOMOEO PHARMACY
                </p>
              </div>
            </button>

            {/* Shared universal search */}
            <div className="flex-1 flex justify-center min-w-0">
              <div className="w-full max-w-[500px] min-w-[420px] px-1">
                <div className="w-full h-[48px] rounded-full">
                  <SearchBox
                    className="h-full w-full flex items-center gap-2 bg-white rounded-full px-3 shadow-md border border-neutral-100/70 transition-[transform,border-color,box-shadow] duration-300 hover:border-[var(--brand-300)] focus-within:ring-4 focus-within:ring-[var(--brand-200)]"
                    placeholder="Search medicines, brands..."
                    ariaLabel="Universal Search"
                  />
                </div>
              </div>
              <div className="hidden md:block flex-1" />
            </div>


            {/* Desktop nav */}
            <div className="hidden lg:flex items-center flex-nowrap justify-center gap-7">
              <div className="flex items-center gap-7">
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

              <div className="flex items-center gap-3 ml-2">
                {/* Quick action icons */}
                <button
                  type="button"
                  aria-label="Wishlist"
                  onClick={handleWishlistOpen}
                  className="relative w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex-shrink-0
                           flex items-center justify-center text-white transition duration-200
                           hover:scale-105 active:scale-95"
                >
                  <FiHeart className="text-base" />

                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[var(--brand-500)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ring-2 ring-[var(--neutral-900)]">
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  )}
                </button>

                <NavLink
                  to="/Cart"
                  className="relative w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex-shrink-0
                           flex items-center justify-center text-white transition duration-200
                           hover:scale-105 active:scale-95"
                >
                  <BsCart3 className="text-base" />

                  {totalCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[var(--brand-500)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ring-2 ring-[var(--neutral-900)]">
                      {totalCount > 99 ? "99+" : totalCount}
                    </span>
                  )}
                </NavLink>

                {user ? (
                  <div className="relative flex-shrink-0" ref={profileRef}>
                    <div
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-2 cursor-pointer bg-white/10 hover:bg-white/15 pl-2 pr-2.5 py-1 rounded-full transition border border-white/10 whitespace-nowrap max-w-[220px]"
                    >
                      <img
                        src={`https://ui-avatars.com/api/?name=${user.user_name}&background=22c55e&color=fff&bold=true`}
                        alt="avatar"
                        className="w-9 h-9 rounded-full ring-2 ring-[var(--brand-400)]"
                      />

                      <div className="hidden sm:flex flex-col leading-tight">
                        <p className="text-white font-semibold text-sm leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                          {user.user_name}
                        </p>
                        <p className="text-[var(--brand-300)] text-[10px] tracking-wider whitespace-nowrap">
                          My Account
                        </p>
                      </div>
                    </div>


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
                    className="btn-primary h-[48px] px-5 whitespace-nowrap text-sm rounded-xl flex items-center justify-center"
                  >
                    Login / Sign Up
                  </NavLink>
                ) : null
              )}

            </div>

            {/* Mobile right cluster */}
            <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
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

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="lg:hidden fixed top-[88px] left-0 w-full
                     bg-[var(--neutral-900)]/98 backdrop-blur-lg
                     flex flex-col items-stretch gap-2 py-6 px-4
                     shadow-2xl z-40 transition-all duration-200
                     max-h-[calc(100vh-88px)] overflow-y-auto"
        >
          {/* Mobile search (full width) */}
          <div className="w-full">
            <div className="h-[48px]">
              <SearchBox
                className="h-full w-full flex items-center gap-2 bg-white rounded-full px-3 shadow-md border border-neutral-100/70 focus-within:ring-4 focus-within:ring-[var(--brand-200)] transition"
                placeholder="Search..."
                ariaLabel="Universal Search"
              />
            </div>
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
            <div className="flex flex-col items-center gap-3 mt-2 pt-4 border-t border-white/10">
              {/* Keep Wishlist/Cart as icons (outside), so no extra links here */}
              <img
                src={`https://ui-avatars.com/api/?name=${user.user_name}&background=22c55e&color=fff&bold=true`}
                alt="avatar"
                className="w-16 h-16 rounded-full ring-2 ring-[var(--brand-400)]"
              />
              <p className="text-white font-semibold">{user.user_name}</p>

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
      )}
    </>
  );
};

export default Navbar;

