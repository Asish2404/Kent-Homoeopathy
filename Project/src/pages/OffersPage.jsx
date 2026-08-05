import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard";

function normalizeProduct(raw) {
  const mrp = Number(raw.mrp_price ?? raw.mrp ?? raw.originalPrice ?? 0);
  const price = Number(raw.discount_price ?? raw.price ?? raw.currentPrice ?? 0);
  const discount = Number(raw.discountPercent ?? raw.discount ?? (mrp > price && mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0));

  return {
    id: raw._id || raw.id,
    _id: raw._id || raw.id,
    name: raw.product_name || raw.name || "",
    image: raw.product_image || raw.image || "",
    price,
    oldPrice: mrp > price ? mrp : undefined,
    rating: Number(raw.rating || 0),
    reviews: Number(raw.review_count || raw.reviews || 0),
    discount: `${discount}%`,
    badge: raw.brand || "",
  };
}

export default function OffersPage() {
  const [searchParams] = useSearchParams();
  const discountParam = Number(searchParams.get("discount") || 0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/products", {
          params: Number.isFinite(discountParam) && discountParam > 0 ? { discount: discountParam } : {},
        });
        const items = res.data?.products || [];
        if (mounted) setProducts(Array.isArray(items) ? items.map(normalizeProduct) : []);
      } catch (err) {
        if (mounted) {
          setProducts([]);
          setError(err?.response?.data?.message || err.message || "Failed to load offers.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [discountParam]);

  const title = useMemo(() => {
    return Number.isFinite(discountParam) && discountParam > 0 ? `${discountParam}% and above offers` : "All offers";
  }, [discountParam]);

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="section-eyebrow">Exclusive Offers</span>
          <h1 className="section-title mt-3">{title}</h1>
          <p className="section-subtitle">Products filtered by active discount percentage.</p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-neutral-500 font-medium">Loading offers...</div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-neutral-500 font-medium">No products match this offer.</div>
        ) : (
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} className="w-full" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}