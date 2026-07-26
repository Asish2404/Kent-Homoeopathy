export function readList(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export const STATUS_PROGRESS = {
  Pending: "5%",
  Confirmed: "15%",
  Processing: "35%",
  Packed: "55%",
  Shipped: "75%",
  "Out for Delivery": "90%",
  Delivered: "100%",
  Cancelled: "0%",
  Returned: "100%",
  Refunded: "100%",
};

export const STATUS_STYLE = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Processing: "bg-amber-100 text-amber-700",
  Packed: "bg-indigo-100 text-indigo-700",
  Shipped: "bg-purple-100 text-purple-700",
  "Out for Delivery": "bg-orange-100 text-orange-700",
  Delivered: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-red-100 text-red-700",
  Returned: "bg-pink-100 text-pink-700",
  Refunded: "bg-teal-100 text-teal-700",
};

export const STATUS_ICON_COLOR = {
  Pending: "text-yellow-600",
  Confirmed: "text-blue-600",
  Processing: "text-amber-600",
  Packed: "text-indigo-600",
  Shipped: "text-purple-600",
  "Out for Delivery": "text-orange-600",
  Delivered: "text-emerald-600",
  Cancelled: "text-red-600",
  Returned: "text-pink-600",
  Refunded: "text-teal-600",
};

export function getStatusDisplay(status) {
  if (!status) return "Pending";
  // Capitalize first letter of each word
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

