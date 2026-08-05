import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function OffersSection() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadBanners = async () => {
      try {
        const res = await api.get("/banners");
        const items = res.data?.banners || [];
        if (mounted) setBanners(Array.isArray(items) ? items : []);
      } catch {
        if (mounted) setBanners([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadBanners();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading || banners.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-20 section-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="section-eyebrow">Exclusive Offers</span>
          <h2 className="section-title mt-3">
            Save More on <span className="brand-gradient-text">Selected Products</span>
          </h2>
          <p className="section-subtitle">Browse active banner offers and jump straight to discounted products.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {banners.slice(0, 6).map((banner) => (
            <button
              key={banner._id}
              type="button"
              onClick={() => navigate(`/offers?discount=${banner.discountPercent}`)}
              className="group relative overflow-hidden rounded-3xl bg-white border border-neutral-100 shadow-sm hover:shadow-xl text-left card-lift"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-600)]/95 via-[var(--brand-700)]/90 to-[var(--brand-900)]/95" />
              <img
                src={banner.image}
                alt={banner.title}
                className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-screen transition-transform duration-700 group-hover:scale-105"
              />
              <div className="relative p-6 md:p-7 min-h-[220px] flex flex-col justify-end text-white">
                <span className="inline-flex items-center self-start rounded-full bg-white/15 backdrop-blur px-3 py-1 text-sm font-semibold border border-white/20">
                  {banner.discountPercent}% OFF
                </span>
                <h3 className="mt-5 text-2xl font-bold leading-tight">{banner.title}</h3>
                {banner.brand ? <p className="mt-2 text-sm text-white/80">{banner.brand}</p> : null}
                <span className="mt-5 inline-flex items-center text-sm font-semibold text-white/90">
                  Explore offers
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}