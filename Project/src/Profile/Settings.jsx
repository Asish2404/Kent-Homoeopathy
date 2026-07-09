import { useMemo, useState } from "react";
import { User, Lock, Bell, MapPin, LogOut } from "lucide-react";

function Field({ Icon, label, children }) {
  return (
    <div className="bg-white rounded-3xl shadow-md p-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gray-50 border flex items-center justify-center">
          <Icon size={18} className="text-emerald-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{label}</h3>
          <div className="mt-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function Settings({ user, onLogout }) {
  const safeUser = user || {};
  const [form, setForm] = useState({
    fullName: safeUser.user_name || "",
    email: safeUser.email || "",
    phone: safeUser.phone || "",
    address: safeUser.address || "",
    password: "",
  });

  const [savedMsg, setSavedMsg] = useState("");

  const canSave = useMemo(() => {
    return Boolean(form.fullName && form.email);
  }, [form.fullName, form.email]);

  const handleSave = () => {
    // Placeholder: keeps UI consistent without breaking existing behavior.
    // Persist is handled in Profile.jsx currently via the Edit Profile modal.
    if (!canSave) return;
    setSavedMsg("Settings updated (locally). ");
    setTimeout(() => setSavedMsg(""), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Settings</h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Field Icon={User} label="Personal Information">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Full Name</p>
              <input
                className="mt-2 w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-emerald-500"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Phone</p>
              <input
                className="mt-2 w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-emerald-500"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs text-gray-400 uppercase font-semibold">Email</p>
            <input
              className="mt-2 w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-emerald-500"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
        </Field>

        <Field Icon={Lock} label="Change Password">
          <p className="text-sm text-gray-500">This section is a placeholder. Connect backend password change when ready.</p>
          <div className="mt-4">
            <p className="text-xs text-gray-400 uppercase font-semibold">New Password</p>
            <input
              type="password"
              className="mt-2 w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-emerald-500"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold hover:from-emerald-600 hover:to-green-700 transition disabled:opacity-50"
            >
              Save Password
            </button>
            {savedMsg ? <p className="text-xs text-emerald-700 mt-2">{savedMsg}</p> : null}
          </div>
        </Field>

        <Field Icon={Bell} label="Notifications">
          <div className="space-y-3">
            {[
              { title: "Order updates", desc: "Status changes for your orders." },
              { title: "Appointment reminders", desc: "Time-sensitive notifications." },
              { title: "Promotions", desc: "Optional marketing messages." },
            ].map((n) => (
              <label key={n.title} className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-1" />
                <div>
                  <p className="font-semibold text-gray-800">{n.title}</p>
                  <p className="text-sm text-gray-500">{n.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </Field>

        <Field Icon={MapPin} label="Address">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">Saved Address</p>
            <textarea
              className="mt-2 w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-emerald-500 min-h-[120px]"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
            <button
              type="button"
              onClick={handleSave}
              className="mt-4 inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-2xl font-semibold transition"
            >
              Save Address
            </button>
          </div>
        </Field>
      </div>

      <div className="bg-white rounded-3xl shadow-md p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Logout</h3>
            <p className="text-sm text-gray-500 mt-1">End your session on this device.</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-4 py-2 rounded-2xl font-semibold transition"
          >
            Logout <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

