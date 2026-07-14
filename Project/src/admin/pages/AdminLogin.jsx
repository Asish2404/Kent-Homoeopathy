import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminStorage } from "../utils/storage";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const formValid = useMemo(() => {
    return email.trim().length > 0 && password.length > 0;
  }, [email, password]);

  const submit = (e) => {
    e.preventDefault();
    const ok =
      email.trim().toLowerCase() === "admin@drkent.com" &&
      password === "Admin@123";

    if (!ok) {
      setError("Invalid Admin Email or Password");
      return;
    }

    adminStorage.login("Administrator");
    navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-neutral-200 rounded-3xl shadow-brand-lg p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-3xl bg-brand-50 border border-brand-200 grid place-items-center">
              <span className="text-brand-700 font-extrabold">DK</span>
            </div>
            <div>
              <div className="text-sm text-neutral-500 font-semibold">Admin Dashboard</div>
              <h2 className="text-2xl font-extrabold text-neutral-900">Sign in</h2>
            </div>
          </div>

          <p className="mt-3 text-sm text-neutral-600">
            Healthcare operations, analytics and inventory management.
          </p>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-neutral-900">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none focus:border-brand-400 focus:ring-0"
                placeholder="admin@drkent.com"
                autoComplete="username"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-neutral-900">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none focus:border-brand-400 focus:ring-0"
                placeholder="Admin@123"
                autoComplete="current-password"
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-semibold">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!formValid}
              className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Login
            </button>

            <div className="text-xs text-neutral-500 leading-relaxed">
              Temporary credentials only (frontend mock):
              <div className="mt-1">
                <span className="font-semibold">admin@drkent.com</span> /{" "}
                <span className="font-semibold">Admin@123</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

