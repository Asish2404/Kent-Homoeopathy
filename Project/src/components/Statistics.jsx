import {
  FaTruck,
  FaUsers,
  FaPills,
  FaCity,
} from "react-icons/fa";
import StatCard from "./StatCard";

const stats = [
  { icon: <FaTruck />, value: 15000, label: "Orders Delivered", accent: "brand" },
  { icon: <FaUsers />, value: 8500, label: "Happy Customers", accent: "emerald" },
  { icon: <FaPills />, value: 250, label: "Healthcare Products", accent: "teal" },
  { icon: <FaCity />, value: 150, label: "Cities Served", accent: "brand" },
];

const Statistics = () => {
  return (
    <section className="relative py-20 md:py-24 overflow-hidden">
      {/* Soft background */}
      <div className="absolute inset-0 section-mint" />
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full
                   bg-[var(--brand-200)] opacity-30 blur-3xl"
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full
                   bg-emerald-200 opacity-30 blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="section-eyebrow">Trusted Nationwide</span>
          <h2 className="section-title mt-3">
            Healthcare at a <span className="brand-gradient-text">glance</span>
          </h2>
          <p className="section-subtitle">
            Numbers that reflect our commitment to delivering genuine
            homoeopathic care to every doorstep.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {stats.map((s, i) => (
            <div
              key={i}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <StatCard {...s} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Statistics;
