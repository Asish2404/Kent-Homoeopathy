import { useNavigate } from "react-router-dom";
import {
  FaStethoscope,
  FaCalendarAlt,
  FaFlask,
  FaPills,
  FaHeadset,
} from "react-icons/fa";

const ICON_MAP = {
  stethoscope: FaStethoscope,
  calendar: FaCalendarAlt,
  flask: FaFlask,
  pills: FaPills,
  headset: FaHeadset,
};

/**
 * Quick-access service strip (Healthmug/pharmacy style).
 * Each item = icon + label, tappable, routes to a real page.
 *
 * Props:
 *  - services: [{ iconKey, label, route }]
 */
const HomeServiceStrip = ({ services = [] }) => {
  const navigate = useNavigate();

  if (!services.length) return null;

  return (
    <section className="relative z-10 -mt-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-[1600px] mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-100
                        p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {services.map((s, i) => {
            const Icon = ICON_MAP[s.iconKey] || FaPills;
            return (
              <button
                key={i}
                type="button"
                onClick={() => s.route && navigate(s.route)}
                className="group flex items-center justify-center gap-2 sm:gap-3 px-2 py-3 sm:py-4 rounded-xl
                           hover:bg-[var(--brand-50)] transition text-left
                           cursor-pointer"
                aria-label={s.label}
              >
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl
                             bg-gradient-to-br from-[var(--brand-500)] to-[var(--brand-700)]
                             flex items-center justify-center text-white text-base sm:text-xl
                             shadow-md shrink-0
                             group-hover:scale-110 group-hover:-rotate-3 transition"
                >
                  <Icon />
                </div>
                <span className="font-semibold text-neutral-800 text-xs sm:text-sm leading-tight">
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomeServiceStrip;
