import { useMemo } from "react";
import { ShoppingBag, ShoppingCart, Heart, FlaskConical, User, Mail, Phone, MapPin, Calendar, Award } from "lucide-react";

function AnimatedCount({ target }) {
  return target;
}

export default function Overview({ user, orders, appointments, wishlistItems, cartTotalCount, AnimatedCountComponent }) {

  const stats = useMemo(
    () => [
      {
        label: "Total Orders",
        value: (orders || []).length,
        Icon: ShoppingBag,
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
      },
      {
        label: "Cart Items",
        value: cartTotalCount || 0,
        Icon: ShoppingCart,
        iconBg: "bg-teal-100",
        iconColor: "text-teal-600",
      },
      {
        label: "Wishlist",
        value: (wishlistItems || []).length,
        Icon: Heart,
        iconBg: "bg-rose-100",
        iconColor: "text-rose-500",
      },
      {
        label: "Lab Tests",
        value: (appointments || []).length,
        Icon: FlaskConical,
        iconBg: "bg-violet-100",
        iconColor: "text-violet-500",
      },
    ],
    [appointments, orders, user, wishlistItems]
  );

  const infoRows = useMemo(
    () => [
      { Icon: User, label: "Full Name", val: user?.user_name || "—" },
      { Icon: Mail, label: "Email Address", val: user?.email || "—" },
      { Icon: Phone, label: "Phone Number", val: user?.phone || "—" },
      { Icon: MapPin, label: "Address", val: user?.address || "—" },
      { Icon: Calendar, label: "Member Since", val: "2025" },
      { Icon: Award, label: "Membership", val: "Gold Member" },
    ],
    [user]
  );

  const Count = AnimatedCountComponent || AnimatedCount;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((item, index) => (
          <div key={index} className="bg-white rounded-3xl shadow-md p-5 hover:-translate-y-1 transition">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.iconBg}`}>
              <item.Icon className={item.iconColor} size={22} />
            </div>
            <h2 className="text-3xl font-bold mt-4 text-gray-800">
              <Count target={item.value} />
            </h2>
            <p className="text-gray-500 text-sm mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Account Information</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {infoRows.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl p-4 flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <item.Icon size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">{item.label}</p>
                <p className="text-gray-800 font-semibold mt-1">{item.val}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

