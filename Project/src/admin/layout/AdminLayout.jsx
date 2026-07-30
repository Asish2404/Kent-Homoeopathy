import { useMemo, useState } from "react";

import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Sun,
  Moon,
  LogOut,
  Menu,
  User,
} from "lucide-react";

const navItems = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/inventory", label: "Inventory" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/reviews", label: "Reviews" },
  { to: "/admin/coupons", label: "Coupons" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/reports", label: "Reports" },
  { to: "/admin/settings", label: "Settings" },
];

const SidebarLink = ({ to, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      [
        "flex items-center gap-3 px-3 py-2 rounded-lg transition",
        isActive
          ? "bg-brand-50 border border-brand-200 text-brand-700 shadow-sm"
          : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900",
      ].join(" ")
    }
  >
    <span
      className="w-2 h-2 rounded-full bg-brand-500 opacity-80"
      aria-hidden
    />
    <span className="text-sm font-semibold">{label}</span>
  </NavLink>
);

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const adminName = window.localStorage.getItem("userName") || "Administrator";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const sidebar = useMemo(
    () => (
      <div className="h-full flex flex-col gap-4">
        <div className="px-4 pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-200 grid place-items-center shadow-sm">
              <span className="text-brand-700 font-extrabold">DK</span>
            </div>
            <div>
              <div className="text-sm font-extrabold text-neutral-900">Kent Admin</div>
              <div className="text-xs text-neutral-500">Healthcare Operations</div>
            </div>
          </div>
        </div>

        <nav className="px-3 pb-6 flex flex-col gap-1 overflow-auto">
          {navItems.map((it) => (
            <SidebarLink
              key={it.to}
              to={it.to}
              label={it.label}
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </nav>

        <div className="px-3 pb-4">
          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition"
            onClick={() => {
              window.localStorage.removeItem("isLoggedIn");
              window.localStorage.removeItem("role");
              window.localStorage.removeItem("userName");
              navigate("/login");
            }}
          >
            <LogOut size={16} className="text-neutral-700" />
            <span className="text-sm font-semibold">Logout</span>
          </button>
        </div>
      </div>
    ),
    [navigate]
  );

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-neutral-50">
        {/* Mobile drawer */}
        <div
          className={
            "fixed inset-0 z-40 transition " +
            (mobileOpen ? "opacity-100" : "pointer-events-none opacity-0")
          }
          aria-hidden
        >
          <div
            className="absolute inset-0 bg-neutral-900/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white border-r border-neutral-200 shadow-lg overflow-hidden">
            {sidebar}
          </div>
        </div>

        <div className="hidden lg:grid lg:grid-cols-[280px_1fr] min-h-screen">
          <aside className="bg-white border-r border-neutral-200">{sidebar}</aside>

          <section className="flex flex-col">
            {/* Topbar */}
            <header className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-neutral-700 text-xs">{location.pathname}</div>
                  <h1 className="text-xl font-extrabold text-neutral-900">
                    {location.pathname === "/admin"
                      ? "Dashboard"
                      : location.pathname
                          .replace("/admin/", "")
                          .replace(/-/g, " ")}
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-2 border border-neutral-200 rounded-xl px-3 py-2 bg-white shadow-sm">
                    <Search size={16} className="text-neutral-500" />
                    <input
                      className="outline-none text-sm w-64"
                      placeholder="Search admin..."
                    />
                  </div>

                  <button
                    className="p-2 rounded-xl hover:bg-neutral-50 transition"
                    aria-label="Notifications"
                  >
                    <Bell size={18} className="text-neutral-700" />
                  </button>

                  <button
                    className="p-2 rounded-xl hover:bg-neutral-50 transition"
                    aria-label="Toggle dark mode"
                    onClick={() => setDarkMode((v) => !v)}
                  >
                    {darkMode ? (
                      <Sun size={18} className="text-neutral-700" />
                    ) : (
                      <Moon size={18} className="text-neutral-700" />
                    )}
                  </button>

                  <div className="flex items-center gap-3 pl-2">
                    <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-200 grid place-items-center">
                      <User size={18} className="text-brand-700" />
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-sm font-bold text-neutral-900 leading-4">{adminName}</div>
                      <div className="text-xs text-neutral-500 leading-4">Admin</div>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <div className="p-4 md:p-6 overflow-y-auto">
              <Outlet />
            </div>
          </section>
        </div>

        {/* Mobile layout */}
        <div className="lg:hidden">
          <header className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <button
                className="p-2 rounded-xl hover:bg-neutral-50 transition"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
              >
                <Menu size={20} className="text-neutral-700" />
              </button>

              <div className="min-w-0">
                <div className="text-xs text-neutral-500 truncate">Admin</div>
                <div className="text-lg font-extrabold text-neutral-900 truncate">
                  {location.pathname === "/admin"
                    ? "Dashboard"
                    : location.pathname
                        .replace("/admin/", "")
                        .replace(/-/g, " ")}
                </div>
              </div>

              <button
                className="p-2 rounded-xl hover:bg-neutral-50 transition"
                aria-label="Toggle dark mode"
                onClick={() => setDarkMode((v) => !v)}
              >
                {darkMode ? (
                  <Sun size={18} className="text-neutral-700" />
                ) : (
                  <Moon size={18} className="text-neutral-700" />
                )}
              </button>
            </div>
          </header>

          <div className="p-4 overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

