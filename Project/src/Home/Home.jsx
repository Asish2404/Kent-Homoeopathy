import { FaUserMd, FaStethoscope, FaCheckCircle } from "react-icons/fa";
import { FiArrowRight, FiHeadphones, FiAward } from "react-icons/fi";
import Carousel from "../components/Carousel";
import HomeServiceStrip from "../components/HomeServiceStrip";
import CategoryTile from "../components/CategoryTile";
import ConcernTile from "../components/ConcernTile";
import BrandLogoStrip from "../components/BrandLogoStrip";
import PromoBannerCarousel from "../components/PromoBannerCarousel";
import ProductSlider from "../components/ProductSlider";
import Statistics from "../components/Statistics";
import slides from "../data/Slides";
import { useNavigate } from "react-router-dom";
import { featuredProducts, allCategories } from "../data/products";
import {
  categories,
  healthConcerns,
  brands,
  homeServices,
} from "../data/homepage";

const Home = () => {
  const navigate = useNavigate();

  const whyChooseUs = [
    {
      icon: <FaUserMd />,
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

      {/* Quick-Access Service Strip */}
      <HomeServiceStrip services={homeServices} />

      {/* Featured Products */}
      <section className="pt-6 pb-2">
        <ProductSlider
          title="Featured Products"
          subtitle="Handpicked for you"
          products={featuredProducts}
          onViewAll={() => navigate("/Products")}
          bgClass="bg-transparent"
          compact
        />
      </section>

      {/* Shop by Category */}
      <section className="py-6">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-end justify-between gap-6 mb-5">
            <div>
              <span className="section-eyebrow">Browse</span>
              <h2 className="section-title mt-2">
                Shop by <span className="brand-gradient-text">Category</span>
              </h2>
            </div>
            <button
              onClick={() => navigate("/Products")}
              className="btn-outline group hidden sm:inline-flex"
            >
              View All
              <FiArrowRight className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {categories.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto scroll-smooth no-scrollbar pb-2">
              {categories.map((c) => (
                <CategoryTile key={c.id} category={c} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-400">
              Categories coming soon.
            </div>
          )}

          <div className="flex justify-center mt-4 sm:hidden">
            <button
              onClick={() => navigate("/Products")}
              className="btn-outline group"
            >
              View All
              <FiArrowRight className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* Top Brands */}
      <section className="py-6 section-soft">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-end justify-between gap-6 mb-5">
            <div>
              <span className="section-eyebrow">Trusted Names</span>
              <h2 className="section-title mt-2">
                Top <span className="brand-gradient-text">Brands</span>
              </h2>
            </div>
          </div>

          {brands.length > 0 ? (
            <BrandLogoStrip brands={brands} />
          ) : (
            <div className="text-center py-8 text-neutral-400">
              Brands coming soon.
            </div>
          )}
        </div>
      </section>

      {/* Shop by Concern */}
      <section className="py-6">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-end justify-between gap-6 mb-5">
            <div>
              <span className="section-eyebrow">Find relief</span>
              <h2 className="section-title mt-2">
                Health <span className="brand-gradient-text">Concern</span>
              </h2>
              <p className="section-subtitle mt-2">
                Shop by disease / concern
              </p>
            </div>
          </div>

          {healthConcerns.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto scroll-smooth no-scrollbar pb-2">
              {healthConcerns.map((c) => (
                <ConcernTile key={c.slug} concern={c} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-400">
              Health concerns coming soon.
            </div>
          )}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="pt-2 pb-6">
        <PromoBannerCarousel />
      </section>

      {/* Category product sections (reusable sliders) */}
      {allCategories.map((cat, idx) => (
        <ProductSlider
          key={cat.id}
          title={cat.title}
          subtitle={cat.subtitle}
          products={cat.products}
          onViewAll={() => navigate(`/Products?category=${cat.id}`)}
          viewAllLabel={`View All ${cat.title}`}
          bgClass={idx % 2 === 0 ? "bg-white" : "section-soft"}
          compact
        />
      ))}

      {/* Why Choose Us */}
      <section className="pt-6 pb-6 section-mint relative overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full
                     bg-[var(--brand-200)] opacity-40 blur-3xl"
        />
        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-8">
            <span className="section-eyebrow">Why Dr. Kent</span>
            <h2 className="section-title mt-3">
              Healthcare you can <span className="brand-gradient-text">trust</span>
            </h2>
            <p className="section-subtitle">
              Four pillars that make us the preferred homoeopathy partner for
              thousands of families.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {whyChooseUs.map((w, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 md:p-7 border border-neutral-100
                           shadow-sm hover:shadow-xl card-lift group
                           animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div
                  className="w-12 h-12 md:w-14 md:h-14 rounded-2xl
                             bg-gradient-to-br from-[var(--brand-500)] to-[var(--brand-700)]
                             flex items-center justify-center text-white text-xl md:text-2xl
                             shadow-lg shadow-[var(--brand-600)]/30
                             group-hover:scale-110 group-hover:rotate-6 transition mb-4"
                >
                  {w.icon}
                </div>
                <h3 className="text-base md:text-lg font-bold text-neutral-900 mb-1.5">
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
      <section className="py-6">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div
            className="relative overflow-hidden rounded-3xl
                       bg-gradient-to-br from-[var(--brand-600)] via-[var(--brand-700)] to-[var(--brand-900)]
                       p-6 md:p-14 text-white"
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

            <div className="relative grid md:grid-cols-2 gap-6 md:gap-8 items-center">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                                 bg-white/15 backdrop-blur border border-white/20
                                 text-sm font-semibold mb-4">
                  <FaStethoscope />
                  Free First Consultation
                </span>
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3
                               font-['Plus_Jakarta_Sans']">
                  Not sure what you need?
                  <br />
                  <span className="text-[var(--brand-200)]">Talk to a doctor.</span>
                </h2>
                <p className="text-[var(--brand-100)] max-w-md leading-relaxed text-sm md:text-base">
                  Get personalised guidance from certified homeopathy practitioners —
                  online, on call, or in-person.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row md:justify-end gap-3">
                <button
                  onClick={() => navigate("/Consult")}
                  className="bg-white text-[var(--brand-700)] font-semibold
                             px-6 md:px-7 py-3 rounded-xl
                             hover:bg-[var(--brand-50)] hover:shadow-xl
                             transition flex items-center justify-center gap-2 group"
                >
                  Book Consultation
                  <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => navigate("/Labtest")}
                  className="bg-white/10 backdrop-blur border border-white/30
                             text-white font-semibold px-6 md:px-7 py-3 rounded-xl
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
