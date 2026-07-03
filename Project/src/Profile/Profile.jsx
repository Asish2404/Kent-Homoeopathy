import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Heart,
  ShoppingCart,
  LogOut,
  Trash2,
  CheckCircle,
  Edit3,
  Package,
  Camera,
  Lock,
  Home,
  Briefcase,
  Award,
  ChevronRight,
  X,
  FlaskConical,
  Calendar,
} from "lucide-react";
import { useCartContext } from "../Cart/CartContext";
 
const ORDERS = [
  {
    id: "ORD-8821",
    name: "Arnica Montana 30C",
    brand: "SBL Homeopathy",
    status: "Delivered",
    date: "20 May 2025",
    price: "₹185",
  },
  {
    id: "ORD-8819",
    name: "Rhus Tox 200C",
    brand: "Boiron",
    status: "Shipped",
    date: "18 May 2025",
    price: "₹320",
  },
];

const ADDRESSES = [
  {
    id: 1,
    type: "Home",
    Icon: Home,
    line1: "12B, Park Street",
    line2: "Kolkata, West Bengal",
    isDefault: true,
  },
  {
    id: 2,
    type: "Office",
    Icon: Briefcase,
    line1: "Sector V",
    line2: "Salt Lake, Kolkata",
    isDefault: false,
  },
];

const STATUS_PROGRESS = {
  Delivered: "100%",
  Shipped: "65%",
  Processing: "30%",
};

const STATUS_STYLE = {
  Delivered: "bg-emerald-100 text-emerald-700",
  Shipped: "bg-blue-100 text-blue-700",
  Processing: "bg-amber-100 text-amber-700",
};

const readList = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

function AnimatedCount({ target }) {

  const [val, setVal] = useState(0);

  useEffect(() => {

    let current = 0;

    const step = Math.max(1, Math.ceil(target / 25));

    const timer = setInterval(() => {

      current = Math.min(current + step, target);

      setVal(current);

      if (current >= target) clearInterval(timer);

    }, 40);

    return () => clearInterval(timer);

  }, [target]);

  return <>{val}</>;

}

export default function Profile() {

  const [tab, setTab] = useState("overview");
  const [showEdit, setShowEdit] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const cart = useCartContext();

  const [user, setUser] = useState(() => {

    try {

      return JSON.parse(localStorage.getItem("user"));

    } catch {

      return null;

    }

  });

  const [form, setForm] = useState(user || {});
  const orders = readList("profile_orders_v1", ORDERS);
  const appointments = readList("profile_appointments_v1", []);

  useEffect(() => {
    if (location.state?.tab) {
      setTab(location.state.tab);
    }
  }, [location.state]);

  if (!user) {

    return (
      <div className="min-h-screen flex items-center justify-center text-3xl font-bold text-gray-700">
        Please Login First
      </div>
    );

  }

  const handleAvatarChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (ev) => setAvatarUrl(ev.target.result);

    reader.readAsDataURL(file);

  };

  const handleSave = () => {

    setUser(form);

    localStorage.setItem("user", JSON.stringify(form));

    setShowEdit(false);

  };

  const handleLogout = () => {

    localStorage.removeItem("user");

    navigate("/Login");

  };

  const wishlistItems = cart.wishlistItems || [];

  const STATS = [
    {
      label: "Total Orders",
      value: orders.length,
      Icon: ShoppingBag,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Cart Items",
      value: cart.totalCount,
      Icon: ShoppingCart,
      iconBg: "bg-teal-100",
      iconColor: "text-teal-600",
    },
    {
      label: "Wishlist",
      value: wishlistItems.length,
      Icon: Heart,
      iconBg: "bg-rose-100",
      iconColor: "text-rose-500",
    },
    {
      label: "Lab Tests",
      value: appointments.length,
      Icon: FlaskConical,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-500",
    },
  ];

  const INFO_ROWS = [
    {
      Icon: User,
      label: "Full Name",
      val: user.user_name,
    },
    {
      Icon: Mail,
      label: "Email Address",
      val: user.email,
    },
    {
      Icon: Phone,
      label: "Phone Number",
      val: user.phone,
    },
    {
      Icon: MapPin,
      label: "Address",
      val: user.address,
    },
    {
      Icon: Calendar,
      label: "Member Since",
      val: "2025",
    },
    {
      Icon: Award,
      label: "Membership",
      val: "Gold Member",
    },
  ];

  const TABS = [
    {
      id: "overview",
      label: "Overview",
    },
    {
      id: "orders",
      label: "My Orders",
    },
    {
      id: "appointments",
      label: "Appointments",
    },
    {
      id: "wishlist",
      label: "Wishlist",
    },
    {
      id: "settings",
      label: "Settings",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">

      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="flex flex-col lg:flex-row gap-6">

          <aside className="lg:w-72">

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden sticky top-24">

              <div className="h-28 bg-gradient-to-r from-emerald-500 to-green-600" />

              <div className="px-6 pb-6">

                <div className="relative -mt-12 w-fit">

                  <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">

                    {
                      avatarUrl
                        ?
                        <img
                          src={avatarUrl}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                        :
                        <span className="text-white text-3xl font-bold">
                          {user.user_name[0]}
                        </span>
                    }

                  </div>

                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center cursor-pointer">

                    <Camera size={14} className="text-white" />

                    <input
                      type="file"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />

                  </label>

                </div>

                <h2 className="text-xl font-bold text-gray-800 mt-4">
                  {user.user_name}
                </h2>

                <p className="text-gray-500 text-sm">
                  {user.email}
                </p>

                <div className="flex gap-2 mt-4 flex-wrap">

                  <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle size={12} />
                    Verified
                  </span>

                  <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <Award size={12} />
                    Gold Member
                  </span>

                </div>

                <button
                  onClick={() => {
                    setForm(user);
                    setShowEdit(true);
                  }}
                  className="w-full mt-5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-3 rounded-2xl font-semibold transition"
                >
                  Edit Profile
                </button>

                <div className="mt-6 space-y-2">

                  {
                    TABS.map((item) => (

                      <button
                        key={item.id}
                        onClick={() => setTab(item.id)}
                        className={`w-full text-left px-4 py-3 rounded-2xl transition font-medium ${tab === item.id
                          ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                          : "hover:bg-gray-100 text-gray-600"
                          }`}
                      >
                        {item.label}
                      </button>

                    ))
                  }

                </div>

              </div>

            </div>

          </aside>

          <main className="flex-1">

            {
              tab === "overview" &&
              <div className="space-y-6">

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                  {
                    STATS.map((item, index) => (

                      <div
                        key={index}
                        className="bg-white rounded-3xl shadow-md p-5 hover:-translate-y-1 transition"
                      >

                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.iconBg}`}>

                          <item.Icon className={item.iconColor} size={22} />

                        </div>

                        <h2 className="text-3xl font-bold mt-4 text-gray-800">
                          <AnimatedCount target={item.value} />
                        </h2>

                        <p className="text-gray-500 text-sm mt-1">
                          {item.label}
                        </p>

                      </div>

                    ))
                  }

                </div>

                <div className="bg-white rounded-3xl shadow-md p-6">

                  <h2 className="text-lg font-bold text-gray-800 mb-6">
                    Account Information
                  </h2>

                  <div className="grid md:grid-cols-2 gap-4">

                    {
                      INFO_ROWS.map((item, index) => (

                        <div
                          key={index}
                          className="bg-gray-50 rounded-2xl p-4 flex gap-3"
                        >

                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">

                            <item.Icon size={18} />

                          </div>

                          <div>

                            <p className="text-xs text-gray-400 uppercase font-semibold">
                              {item.label}
                            </p>

                            <p className="text-gray-800 font-semibold mt-1">
                              {item.val}
                            </p>

                          </div>

                        </div>

                      ))
                    }

                  </div>

                </div>

              </div>
            }

          </main>

        </div>

      </div>

      {
        showEdit &&
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">

            <div className="flex items-center justify-between mb-6">

              <div>

                <h2 className="text-xl font-bold text-gray-800">
                  Edit Profile
                </h2>

                <p className="text-sm text-gray-500">
                  Update your information
                </p>

              </div>

              <button
                onClick={() => setShowEdit(false)}
                className="p-2 rounded-xl hover:bg-gray-100"
              >
                <X />
              </button>

            </div>

            <div className="space-y-4">

              {
                [
                  {
                    key: "user_name",
                    label: "Full Name",
                    type: "text",
                  },
                  {
                    key: "email",
                    label: "Email",
                    type: "email",
                  },
                  {
                    key: "phone",
                    label: "Phone",
                    type: "text",
                  },
                  {
                    key: "address",
                    label: "Address",
                    type: "text",
                  },
                ].map((field) => (

                  <div key={field.key}>

                    <label className="text-sm font-semibold text-gray-600">
                      {field.label}
                    </label>

                    <input
                      type={field.type}
                      value={form[field.key]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [field.key]: e.target.value,
                        })
                      }
                      className="w-full mt-2 px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-emerald-500"
                    />

                  </div>

                ))
              }

            </div>

            <div className="flex gap-3 mt-6">

              <button
                onClick={() => setShowEdit(false)}
                className="flex-1 py-3 rounded-2xl border border-gray-200 font-semibold hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold hover:from-emerald-600 hover:to-green-700 transition"
              >
                Save Changes
              </button>

            </div>

          </div>

        </div>
      }

    </div>
  );
}