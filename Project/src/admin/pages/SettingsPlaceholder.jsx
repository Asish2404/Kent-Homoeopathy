import React from "react";

const SettingsPlaceholder = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Admin</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Settings</div>
          <div className="mt-1 text-sm text-neutral-500">
            Settings page.
          </div>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-3xl p-6">
        <div className="text-neutral-900 font-extrabold">Configure admin options</div>
        <p className="text-neutral-600 text-sm mt-2">
          This is a simple functional page so the admin flow works end-to-end.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-neutral-900">Site Mode</span>
            <select className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none">
              <option>Production</option>
              <option>Staging</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-neutral-900">Reports Export</span>
            <select className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none">
              <option>Enabled</option>
              <option>Disabled</option>
            </select>
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <button className="btn-primary" type="button">
            Save
          </button>
          <button className="btn-outline" type="button">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPlaceholder;

