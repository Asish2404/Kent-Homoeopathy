import { ShieldCheck, Sparkles } from "lucide-react";

export default function PlaceholderContent({ title, subtitle }) {
  return (
    <div className="bg-white rounded-3xl shadow-md p-8">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">{title || "Coming Soon"}</h2>
          <p className="text-gray-500 mt-1">{subtitle || "This section will appear here once available."}</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-600">
            <Sparkles size={16} />
            Placeholder content
          </div>
        </div>
      </div>
    </div>
  );
}

