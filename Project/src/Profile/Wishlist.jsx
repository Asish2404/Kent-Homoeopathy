import { useMemo } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import EmptyState from "../components/EmptyState";

export default function Wishlist({ items = [], onMoveToCart, onRemove }) {
  const list = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  if (!list.length) {
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        description="Save products you love and find them easily later."
        actionLabel="Continue Shopping"
        action={() => (window.location.href = "/Products")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Wishlist Products</h2>
      </div>

      <div className="space-y-4">
        {list.map((p) => {
          const price = p.price || p.amount || p.cost || "";
          const name = p.name || p.title || "Untitled";
          const img = p.image || p.img || p.thumbnail || p.photo;

          return (
            <div key={p.id} className="bg-white rounded-3xl shadow-md p-5">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gray-50 border overflow-hidden flex items-center justify-center">
                  {img ? (
                    <img src={img} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-sm">No image</span>
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Product</p>
                  <h3 className="text-gray-800 font-semibold mt-1">{name}</h3>
                  {price ? <p className="text-gray-500 mt-1">{price}</p> : null}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onMoveToCart?.(p)}
                    className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-2xl font-semibold transition"
                  >
                    <ShoppingCart size={16} />
                    Move to Cart
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemove?.(p.id)}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

