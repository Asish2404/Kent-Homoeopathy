import { useState, useEffect, useMemo } from "react";
import {
  FaLeaf,
  FaUserMd,
  FaFlask,
  FaTruck,
  FaShieldAlt,
  FaStethoscope,
  FaCheckCircle,
} from "react-icons/fa";
import { FiArrowRight, FiHeadphones, FiAward } from "react-icons/fi";
import Carousel from "../components/Carousel";
import ProductSlider from "../components/ProductSlider";
import Statistics from "../components/Statistics";
import slides from "../data/Slides";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Home = () => {
  const navigate = useNavigate();

// Dynamic homepage product sections + automatic discount collections.
  const [sections, setSections] = useState({
    featured: [],
    new_arrivals: [],
    trending: [],
    best_sellers: [],
    top_picks: [],
    off20: [],
    off30: [],
    off50: [],
    off70: [],
  });

  // Convert a backend product to the ProductCard shape expected by the UI.
  const toCard = (p) => {
    const mrp = Number(p.mrp_price || p.mrp || 0);
    const price = Number(p.discount_price || p.price || p.selling_price || 0);
    const firstVariant = Array.isArray(p.variants) && p.variants.length > 0 ? p.variants[0] : null;
    const vMrp = Number(firstVariant?.mrp_price || mrp);
    const vPrice = Number(firstVariant?.selling_price || firstVariant?.discount_price || price);
    const discountPct = vMrp > 0 && vPrice > 0 ? Math.round((1 - vPrice / vMrp) * 100) : 0;
    return {
      id: p._id,
      _id: p._id,
      name: p.product_name,
      price: vPrice || price,
      oldPrice: vMrp || mrp,
      rating: Number(p.rating || firstVariant?.rating || 0),
      reviews: Number(p.review_count || firstVariant?.review_count || 0),
      image: p.product_image,
      discount: discountPct > 0 ? `-${discountPct}%` : undefined,
      badge: p.best_seller
        ? "Bestseller"
        : p.new_arrival
          ? "New"
          : p.featured
            ? "Featured"
            : p.top_pick
              ? "Top Pick"
              : undefined,
      categoryTitle: p.category?.category_name || p.category || "Products",
      brand: p.brand,
      isInStock: Number(p.stock || 0) > 0,
      stock: Number(p.stock || 0),
      isKentProduct: Boolean(p.isKentProduct),
      variants: p.variants || [],
    };
  };

  const fetchSection = async (section) => {
    try {
      const res = await api.get("/products", { params: { section, limit: 12 } });
      return (res.data?.products || []).map(toCard);
    } catch {
      return [];
    }
  };

  const fetchDiscount = async (discount) => {
    try {
      const res = await api.get("/products", { params: { discount, limit: 12 } });
      return (res.data?.products || []).map(toCard);
    } catch {
      return [];
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [featured, new_arrivals, trending, best_sellers, top_picks, off20, off30, off50, off70] =
        await Promise.all([
          fetchSection("featured"),
          fetchSection("new_arrivals"),
          fetchSection("trending"),
          fetchSection("best_sellers"),
          fetchSection("top_picks"),
          fetchDiscount("20"),
          fetchDiscount("30"),
          fetchDiscount("50"),
          fetchDiscount("70"),
        ]);
if (!cancelled) {
        setSections({ featured, new_arrivals, trending, best_sellers, top_picks, off20, off30, off50, off70 });
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const featuredProducts = sections.featured;
  const discountSections = useMemo(
    () => [
      { key: "off20", title: "20% OFF", subtitle: "Everyday savings", products: sections.off20 },
      { key: "off30", title: "30% OFF", subtitle: "Popular picks at a steal", products: sections.off30 },
      { key: "off50", title: "50% OFF", subtitle: "Big savings, genuine remedies", products: sections.off50 },
      { key: "off70", title: "70% OFF", subtitle: "Unmissable deals", products: sections.off70 },
    ].filter((s) => Array.isArray(s.products) && s.products.length > 0),
    [sections]
  );

  const trendingSection = sections.trending;
  const newArrivalsSection = sections.new_arrivals;
  const bestSellersSection = sections.best_sellers;
  const topPicksSection = sections.top_picks;

  const services = [
    {
      icon: <FaLeaf />,
      title: "Genuine Medicines",
      desc: "100% authentic homoeopathy",
      link: "/Products",
      color: "from-[var(--brand-500)] to-[var(--brand-700)]",
    },
    {
      icon: <FaUserMd />,
      title: "Expert Consultation",
      desc: "Talk to certified doctors",
      link: "/Consult",
      color: "from-emerald-500 to-emerald-700",
    },
    {
      icon: <FaFlask />,
      title: "Home Lab Tests",
      desc: "Book accurate tests at home",
      link: "/Labtest",
      color: "from-teal-500 to-teal-700",
    },
    {
      icon: <FaTruck />,
      title: "Fast Delivery",
      desc: "Doorstep in 24 hours",
      link: "/Products",
      color: "from-[var(--brand-600)] to-emerald-700",
    },
  ];

  const whyChooseUs = [
    {
      icon: <FaShieldAlt />,
      title: "100% Genuine",
      desc: "Every product is sourced from certified manufacturers and verified by our pharmacists.",
    },
    {
      icon: <FiAward />,
      title: "25+ Years Trust",
      desc: "A quarter-century of dedicated service in homoeopathic healthcare.",
    },
    {
      icon: <FiHeadphones />,
      title: "Expert Support",
      desc: "Round-the-clock access to qualified homeopathy practitioners.",
    },
    {
      icon: <FaCheckCircle />,
      title: "Quality Assured",
      desc: "GMP-certified, ISO-compliant storage and handling for every order.",
    },
  ];

  return (
    <>
      {/* Hero Carousel */}
      <Carousel slides={slides} />

      {/* Services strip */}
      <section className="relative -mt-12 z-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-neutral-100
                          p-5 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {services.map((s, i) => (
              <button
                key={i}
                onClick={() => s.link && navigate(s.link)}
                className="group flex items-center gap-3 md:gap-4 p-3 rounded-xl
                           hover:bg-[var(--brand-50)] transition text-left
                           cursor-pointer"
              >
                <div
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl
                              bg-gradient-to-br ${s.color}
                              flex items-center justify-center text-white text-xl
                              shadow-md shrink-0
                              group-hover:scale-110 group-hover:rotate-3 transition`}
                >
                  {s.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-neutral-800 text-sm md:text-base leading-tight">
                    {s.title}
                  </p>
                  <p className="text-xs md:text-sm text-neutral-500 mt-0.5 truncate">
                    {s.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="section-eyebrow">Handpicked for you</span>
            <h2 className="section-title mt-3">
              Featured <span className="brand-gradient-text">Products</span>
            </h2>
            <p className="section-subtitle">
              Best-selling wellness essentials trusted by thousands of customers.
            </p>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap justify-center gap-2.5 mt-6 mb-10">
            {([
              { label: "All", id: "all" },
              { label: "Best Solutions", id: "vitamins" },
              { label: "Diabetic Wellness", id: "diabetes" },
              { label: "Digestive Wellness", id: "digest" },
              { label: "Pain Relief", id: "pain" },
              { label: "Women's Wellness", id: "women" },
              { label: "Skin Wellness", id: "skin" },
            ]).map((tag, i) => (
              <button
                key={i}
                type="button"
                onClick={() =>
                  navigate(tag.id === "all" ? "/Products" : `/Products?category=${tag.id}`)
                }
                className={`
                  px-5 py-2.5 rounded-full text-sm font-medium cursor-pointer transition
                  ${
                    i === 0
                      ? "bg-[var(--brand-600)] text-white shadow-md shadow-[var(--brand-600)]/30"
                      : "bg-white text-neutral-600 border border-neutral-200 hover:border-[var(--brand-300)] hover:text-[var(--brand-700)] hover:bg-[var(--brand-50)]"
                  }
                `}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        <ProductSlider
          title=""
          subtitle=""
          products={featuredProducts}
          onViewAll={() => navigate("/Products")}
          bgClass="bg-transparent"
        />
      </section>

{/* Statistics */}
      <Statistics />

      {/* New Arrivals */}
      {newArrivalsSection.length > 0 && (
        <ProductSlider
          title="New Arrivals"
          subtitle="Fresh from the clinic"
          products={newArrivalsSection}
          onViewAll={() => navigate("/Products")}
          viewAllLabel="View All New Arrivals"
          bgClass="bg-white"
        />
      )}

      {/* Trending Products */}
      {trendingSection.length > 0 && (
        <ProductSlider
          title="Trending Now"
          subtitle="Most loved this week"
          products={trendingSection}
          onViewAll={() => navigate("/Products")}
          viewAllLabel="View All Trending"
          bgClass="section-soft"
        />
      )}

      {/* Best Sellers */}
      {bestSellersSection.length > 0 && (
        <ProductSlider
          title="Best Sellers"
          subtitle="Customer favourites"
          products={bestSellersSection}
          onViewAll={() => navigate("/Products")}
          viewAllLabel="View All Best Sellers"
          bgClass="bg-white"
        />
      )}

      {/* Top Picks of the Day */}
      {topPicksSection.length > 0 && (
        <ProductSlider
          title="Top Picks of the Day"
          subtitle="Handpicked daily"
          products={topPicksSection}
          onViewAll={() => navigate("/Products")}
          viewAllLabel="View All Top Picks"
          bgClass="section-soft"
        />
      )}

      {/* Automatic Discount Collections */}
      {discountSections.map((sec, idx) => (
        <ProductSlider
          key={sec.key}
          title={`${sec.title} OFF`}
          subtitle={sec.subtitle}
          products={sec.products}
          onViewAll={() => navigate(`/Products?discount=${sec.key.replace("off", "")}`)}
          viewAllLabel={`View All ${sec.title} OFF`}
          bgClass={idx % 2 === 0 ? "bg-white" : "section-soft"}
        />
      ))}

      {/* Why Choose Us */}
      <section className="py-20 md:py-24 section-mint relative overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full
                     bg-[var(--brand-200)] opacity-40 blur-3xl"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <span className="section-eyebrow">Why Dr. Kent</span>
            <h2 className="section-title mt-3">
              Healthcare you can <span className="brand-gradient-text">trust</span>
            </h2>
            <p className="section-subtitle">
              Four pillars that make us the preferred homoeopathy partner for
              thousands of families.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((w, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-7 border border-neutral-100
                           shadow-sm hover:shadow-xl card-lift group
                           animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div
                  className="w-14 h-14 rounded-2xl
                             bg-gradient-to-br from-[var(--brand-500)] to-[var(--brand-700)]
                             flex items-center justify-center text-white text-2xl
                             shadow-lg shadow-[var(--brand-600)]/30
                             group-hover:scale-110 group-hover:rotate-6 transition mb-5"
                >
                  {w.icon}
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  {w.title}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {w.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="relative overflow-hidden rounded-3xl
                       bg-gradient-to-br from-[var(--brand-600)] via-[var(--brand-700)] to-[var(--brand-900)]
                       p-8 md:p-14 text-white"
          >
            {/* Decorative shapes */}
            <div
              className="absolute -top-20 -right-20 w-72 h-72 rounded-full
                         bg-white/10 blur-2xl"
            />
            <div
              className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full
                         bg-[var(--accent-mint)]/20 blur-2xl"
            />

            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                                 bg-white/15 backdrop-blur border border-white/20
                                 text-sm font-semibold mb-5">
                  <FaStethoscope />
                  Free First Consultation
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4
                               font-['Plus_Jakarta_Sans']">
                  Not sure what you need?
                  <br />
                  <span className="text-[var(--brand-200)]">Talk to a doctor.</span>
                </h2>
                <p className="text-[var(--brand-100)] max-w-md leading-relaxed">
                  Get personalised guidance from certified homeopathy practitioners —
                  online, on call, or in-person.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row md:justify-end gap-3">
                <button
                  onClick={() => navigate("/Consult")}
                  className="bg-white text-[var(--brand-700)] font-semibold
                             px-7 py-3.5 rounded-xl
                             hover:bg-[var(--brand-50)] hover:shadow-xl
                             transition flex items-center justify-center gap-2 group"
                >
                  Book Consultation
                  <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => navigate("/Labtest")}
                  className="bg-white/10 backdrop-blur border border-white/30
                             text-white font-semibold px-7 py-3.5 rounded-xl
                             hover:bg-white/20 transition"
                >
                  Book Lab Test
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
