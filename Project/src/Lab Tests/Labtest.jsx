import React, { useMemo, useRef, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./labtest.css";
import { useForm } from "react-hook-form";
import heroImg from "../assets/hero.png";
import heroPlaceholderImg from "../assets/lab-hero-placeholder.png";

const Labtest = () => {
  const [date, setDate] = useState(new Date());
  const { register, handleSubmit } = useForm();

  const bookingRef = useRef(null);

  const popularTests = useMemo(
    () => [
      {
        id: "cbc",
        category: "Hematology",
        name: "Complete Blood Count (CBC)",
        description: "Essential screening for blood cells and overall health.",
        reportTime: "24–48 hrs",
        homeCollection: "Yes",
        discountBadge: "Flat ₹100 Off",
        originalPrice: 499,
        discountedPrice: 399,
        formValue: "CBC",
        icon: "🩸",
      },
      {
        id: "thyroid",
        category: "Endocrinology",
        name: "Thyroid Profile",
        description: "Helps evaluate thyroid function and related disorders.",
        reportTime: "24–48 hrs",
        homeCollection: "Yes",
        discountBadge: "Save 20%",
        originalPrice: 999,
        discountedPrice: 799,
        formValue: "Thyroid",
        icon: "🧠",
      },
      {
        id: "diabetes",
        category: "Metabolic",
        name: "Diabetes Screening",
        description: "Track sugar levels with reliable lab diagnostics.",
        reportTime: "24–48 hrs",
        homeCollection: "Yes",
        discountBadge: "Limited Offer",
        originalPrice: 799,
        discountedPrice: 599,
        formValue: "Blood Sugar",
        icon: "🍬",
      },
      {
        id: "lipid",
        category: "Cardiology",
        name: "Lipid Profile",
        description: "Measures cholesterol and triglycerides for heart health.",
        reportTime: "24–48 hrs",
        homeCollection: "Yes",
        discountBadge: "Save ₹150",
        originalPrice: 899,
        discountedPrice: 749,
        formValue: "Lipid",
        icon: "❤️",
      },
      {
        id: "vitd",
        category: "Nutrients",
        name: "Vitamin D",
        description: "Assess vitamin D levels for bone and immunity health.",
        reportTime: "48–72 hrs",
        homeCollection: "Yes",
        discountBadge: "Flat ₹120 Off",
        originalPrice: 1299,
        discountedPrice: 1179,
        formValue: "Full Body Checkup",
        icon: "☀️",
      },
      {
        id: "lft",
        category: "Liver",
        name: "Liver Function Test",
        description: "Check liver enzymes and function for early detection.",
        reportTime: "24–48 hrs",
        homeCollection: "Yes",
        discountBadge: "Save 15%",
        originalPrice: 899,
        discountedPrice: 764,
        formValue: "Full Body Checkup",
        icon: "🧪",
      },
      {
        id: "kft",
        category: "Kidney",
        name: "Kidney Function Test",
        description: "Helps assess kidney health and filtering capacity.",
        reportTime: "24–48 hrs",
        homeCollection: "Yes",
        discountBadge: "Limited Offer",
        originalPrice: 999,
        discountedPrice: 849,
        formValue: "Full Body Checkup",
        icon: "🩺",
      },
      {
        id: "pcr",
        category: "Infectious",
        name: "Covid RT-PCR",
        description: "Accurate RT-PCR testing for COVID-19.",
        reportTime: "12–24 hrs",
        homeCollection: "Yes",
        discountBadge: "Fast Results",
        originalPrice: 1999,
        discountedPrice: 1599,
        formValue: "Full Body Checkup",
        icon: "🦠",
      },
    ],
    []
  );

  const packages = useMemo(
    () => [
      {
        id: "hbcp",
        mostPopular: true,
        name: "Full Body Checkup - Essential",
        testsIncluded: 42,
        suitableFor: "Adults looking for a complete baseline check.",
        fasting: "8–10 hours",
        homeSample: "Yes",
        reportDelivery: "24–72 hrs",
        originalPrice: 2999,
        discountedPrice: 2399,
        saveAmount: 600,
        formValue: "Full Body Checkup",
      },
      {
        id: "diap",
        mostPopular: false,
        name: "Diabetes & Metabolic Care",
        testsIncluded: 18,
        suitableFor: "For sugar monitoring and metabolic risk.",
        fasting: "6–8 hours",
        homeSample: "Yes",
        reportDelivery: "24–48 hrs",
        originalPrice: 1899,
        discountedPrice: 1499,
        saveAmount: 400,
        formValue: "Blood Sugar",
      },
      {
        id: "thy",
        mostPopular: false,
        name: "Thyroid Wellness Package",
        testsIncluded: 14,
        suitableFor: "Evaluate thyroid hormones and support health.",
        fasting: "No fasting required",
        homeSample: "Yes",
        reportDelivery: "24–48 hrs",
        originalPrice: 1599,
        discountedPrice: 1299,
        saveAmount: 300,
        formValue: "Thyroid",
      },
      {
        id: "heart",
        mostPopular: false,
        name: "Heart Health Screening",
        testsIncluded: 20,
        suitableFor: "Cholesterol and cardiovascular risk assessment.",
        fasting: "8–10 hours",
        homeSample: "Yes",
        reportDelivery: "24–48 hrs",
        originalPrice: 2199,
        discountedPrice: 1799,
        saveAmount: 400,
        formValue: "Lipid",
      },
    ],
    []
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");


  const allCategories = useMemo(() => {
    const fromTests = popularTests.map((t) => t.category);
    return ["All", ...Array.from(new Set(fromTests))];
  }, [popularTests]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredTests = useMemo(() => {
    if (!normalizedQuery && activeCategory === "All") return popularTests;
    return popularTests.filter((t) => {
      const matchesQuery =
        !normalizedQuery ||
        t.name.toLowerCase().includes(normalizedQuery) ||
        t.id.toLowerCase().includes(normalizedQuery) ||
        t.category.toLowerCase().includes(normalizedQuery);
      const matchesCategory =
        activeCategory === "All" || t.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [popularTests, normalizedQuery, activeCategory]);

  const filteredPackages = useMemo(() => {
    if (!normalizedQuery) {
      return activeCategory === "All" ? packages : packages; // keep category selector for tests; UX-wise do not break.
    }
    return packages.filter((p) => {
      return (
        p.name.toLowerCase().includes(normalizedQuery) ||
        p.suitableFor.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [packages, normalizedQuery, activeCategory]);

  const scrollToBooking = (labTestValue) => {
    // Keep booking logic unchanged: we only pre-select using the existing <select> options.
    // Since react-hook-form is uncontrolled, we rely on native select value by scrolling.
    // (No backend/API changes; UX enhancement only.)
    if (labTestValue) {
      const el = bookingRef.current?.querySelector('select[name="labtest"]');
      if (el) el.value = labTestValue;
    }
    bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onSubmit = (data) => {
    const msg = `Hello, I am ${data.name} and I want to book a lab test.
                Name: ${data.name}
                Age: ${data.age}
                Phone: ${data.phone}
                Email: ${data.email}
                Test: ${data.labtest}
                Date: ${date.toDateString()}
                Time: ${data.time}`;
    const phone = "917980972894";
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const [reviewIndex, setReviewIndex] = useState(0);
  const reviews = useMemo(
    () => [
      {
        id: 1,
        name: "Ananya Rao",
        rating: 5,
        review:
          "Very smooth home sample collection. Reports came on time and were easy to understand.",
        photo:
          "https://ui-avatars.com/api/?name=Ananya%20Rao&background=dcfce7&color=16a34a",
      },
      {
        id: 2,
        name: "Rohit Sharma",
        rating: 5,
        review:
          "Professional staff and quick turnaround. Booking was effortless and the interface looks premium.",
        photo:
          "https://ui-avatars.com/api/?name=Rohit%20Sharma&background=dcfce7&color=16a34a",
      },
      {
        id: 3,
        name: "Meera Iyer",
        rating: 4,
        review:
          "Clean experience. Home collection and online reports made it convenient for our family.",
        photo:
          "https://ui-avatars.com/api/?name=Meera%20Iyer&background=dcfce7&color=16a34a",
      },
    ],
    []
  );

  const [faqOpen, setFaqOpen] = useState(null);
  const faqs = useMemo(
    () => [
      {
        q: "How long does fasting take?",
        a: "Fasting typically ranges from 6–10 hours depending on the test/package. The card details show the fasting requirement clearly.",
      },
      {
        q: "When will reports be available?",
        a: "Report delivery time varies by test/package. Popular lab tests usually deliver within 24–48 hours (as shown on cards).",
      },
      {
        q: "Can I book home collection?",
        a: "Yes. Home sample collection is available for the packages/tests displayed on this page.",
      },
      {
        q: "Are reports available online?",
        a: "Yes. Once processed, you can access your reports online (reported delivery details are shown on each card).",
      },
    ],
    []
  );

  return (
    <>
      {/* HERO */}
      <section className="lab-hero section-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="lab-hero-columns">
            <div className="lab-hero-left">
              <span className="section-eyebrow">Premium Lab Diagnostics</span>
              <h1 className="section-title mt-3">
                Book Lab Tests with Trusted Home Collection
              </h1>
              <p className="section-subtitle mt-4">
                Clean, fast and reliable testing—backed by experienced professionals. Search by test, package or category and book in seconds.
              </p>

              {/* HERO SEARCH + CTA */}
              <div className="mt-7 lab-hero-actions">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tests by name, package or category..."
                  className="lab-search"
                  aria-label="Search lab tests"
                />
                <button
                  className="btn-primary whitespace-nowrap"
                  onClick={() => scrollToBooking(filteredTests[0]?.formValue || "")}
                >
                  Book Test
                </button>
              </div>

              {/* Secondary quick category selector (tests) */}
              <div className="mt-4 flex flex-wrap gap-2">
                {allCategories.slice(0, 6).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`lab-chip ${activeCategory === cat ? "lab-chip--active" : ""
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="lab-mini">
                  <div className="lab-mini-icon">✓</div>
                  <div>
                    <p className="lab-mini-title">NABL-style Quality</p>
                    <p className="lab-mini-sub">Trusted processes</p>
                  </div>
                </div>
                <div className="lab-mini">
                  <div className="lab-mini-icon">🏠</div>
                  <div>
                    <p className="lab-mini-title">Home Collection</p>
                    <p className="lab-mini-sub">Convenient & safe</p>
                  </div>
                </div>
                <div className="lab-mini">
                  <div className="lab-mini-icon">⏱</div>
                  <div>
                    <p className="lab-mini-title">Fast Reports</p>
                    <p className="lab-mini-sub">On-time delivery</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner image */}
            <div className="lab-hero-right">
              <div className="lab-hero-card">
                <img
                  src={heroImg}
                  alt="Healthcare and lab diagnostics"
                  className="lab-hero-image"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = heroPlaceholderImg;
                  }}
                />
              </div>
              <div className="lab-hero-glow" aria-hidden="true" />
            </div>

          </div>
        </div>
      </section>

      {/* SEARCH RESULTS + POPULAR TESTS */}
      <section className="py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h2 className="section-title" style={{ fontSize: "clamp(1.5rem, 2.8vw, 2.2rem)" }}>
                Popular Lab Tests
              </h2>
              <p className="section-subtitle mt-2" style={{ marginTop: 0 }}>
                {normalizedQuery || activeCategory !== "All"
                  ? `Showing results for “${searchQuery || activeCategory}”`
                  : "Top picks for quick, reliable diagnostics."}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="lab-filter-label">Filter:</span>
              <select
                className="lab-select"
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                aria-label="Filter by category"
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6 mt-8">
            {filteredTests.map((t) => (
              <div key={t.id} className="lab-card card-lift">
                <div className="lab-card-head">
                  <div className="lab-card-icon">{t.icon}</div>
                  <div className="lab-badge">{t.discountBadge}</div>
                </div>

                <h3 className="lab-card-title">{t.name}</h3>
                <p className="lab-card-desc">{t.description}</p>

                <div className="lab-card-meta">
                  <div className="lab-meta">
                    <span className="lab-meta-key">Report time</span>
                    <span className="lab-meta-val">{t.reportTime}</span>
                  </div>
                  <div className="lab-meta">
                    <span className="lab-meta-key">Home collection</span>
                    <span className="lab-meta-val">{t.homeCollection}</span>
                  </div>
                </div>

                <div className="lab-price-row">
                  <span className="lab-original">₹{t.originalPrice}</span>
                  <span className="lab-discount">₹{t.discountedPrice}</span>
                </div>

                <button
                  className="lab-btn"
                  onClick={() => scrollToBooking(t.formValue)}
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section className="py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h2 className="section-title" style={{ fontSize: "clamp(1.5rem, 2.8vw, 2.2rem)" }}>
                Full Body Checkup Packages
              </h2>
              <p className="section-subtitle mt-2" style={{ marginTop: 0 }}>
                Curated packages with clear fasting and report delivery timelines.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6 mt-8">
            {filteredPackages.map((p) => (
              <div key={p.id} className={`lab-card card-lift ${p.mostPopular ? "lab-card--popular" : ""}`}>
                {p.mostPopular && (
                  <div className="lab-popular">Most Popular</div>
                )}

                <div className="lab-card-head">
                  <div className="lab-card-icon">📦</div>
                  <div className="lab-badge">Save ₹{p.saveAmount}</div>
                </div>

                <h3 className="lab-card-title">{p.name}</h3>
                <p className="lab-card-desc">
                  {p.testsIncluded} tests included · {p.suitableFor}
                </p>

                <div className="lab-card-meta">
                  <div className="lab-meta">
                    <span className="lab-meta-key">Fasting</span>
                    <span className="lab-meta-val">{p.fasting}</span>
                  </div>
                  <div className="lab-meta">
                    <span className="lab-meta-key">Home sample</span>
                    <span className="lab-meta-val">{p.homeSample}</span>
                  </div>
                  <div className="lab-meta">
                    <span className="lab-meta-key">Report delivery</span>
                    <span className="lab-meta-val">{p.reportDelivery}</span>
                  </div>
                </div>

                <div className="lab-price-row">
                  <span className="lab-original">₹{p.originalPrice}</span>
                  <span className="lab-discount">₹{p.discountedPrice}</span>
                </div>

                <button
                  className="lab-btn"
                  onClick={() => scrollToBooking(p.formValue)}
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-10 md:py-14 section-mint">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="section-title text-black">
            Why Choose Us
          </h2>
          <p className="section-subtitle mt-2 text-[var(--neutral-600)]" style={{ maxWidth: "48rem" }}>
            Quality diagnostics with a patient-first experience.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mt-8">
            {[
              "NABL Certified Labs",
              "Home Sample Collection",
              "Trusted Reports",
              "Fast Report Delivery",
              "Experienced Professionals",
              "Affordable Pricing",
            ].map((x, idx) => (
              <div key={x} className="lab-why card-lift">
                <div className="lab-why-icon">✓</div>
                <div>
                  <p className="lab-why-title">{x}</p>
                  <p className="lab-why-sub">
                    {idx === 0
                      ? "High standards & calibrated processes"
                      : idx === 1
                        ? "At-home collection with careful handling"
                        : idx === 2
                          ? "Accurate reports you can rely on"
                          : idx === 3
                            ? "Quick timelines for faster decisions"
                            : idx === 4
                              ? "Skilled professionals across specialties"
                              : "Transparent pricing and real value"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="section-title">How it Works</h2>
          <p className="section-subtitle mt-2">
            A simple 4-step process—designed for convenience.
          </p>

          <div className="lab-steps mt-10">
            {[
              {
                title: "Select Test",
                desc: "Choose from popular tests & packages",
              },
              {
                title: "Book Appointment",
                desc: "Pick a date & time slot",
              },
              {
                title: "Home Sample Collection",
                desc: "Sample collection at your home",
              },
              {
                title: "Get Reports Online",
                desc: "Access reports online after processing",
              },
            ].map((item, index) => (
              <div className="lab-step-wrapper" key={item.title}>
                <div className="lab-step">
                  <div className="lab-step-icon">{index + 1}</div>

                  <div>
                    <p className="lab-step-title">{item.title}</p>
                    <p className="lab-step-sub">{item.desc}</p>
                  </div>
                </div>

                {index !== 3 && <div className="lab-arrow"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPECIAL OFFERS */}
      <section className="py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h2 className="section-title">Special Offers</h2>
              <p className="section-subtitle mt-2">Premium deals to make diagnostics affordable.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mt-8">
            {[
              {
                title: "Flat 20% Off",
                desc: "On select tests & packages",
                tag: "Limited",
              },
              {
                title: "Free Home Collection",
                desc: "For eligible lab tests",
                tag: "Popular",
              },
              {
                title: "Health Packages Starting from ₹499",
                desc: "Curated plans with clear timelines",
                tag: "Value",
              },
            ].map((o) => (
              <div key={o.title} className="lab-offer card-lift">
                <div className="lab-offer-tag">{o.tag}</div>
                <p className="lab-offer-title">{o.title}</p>
                <p className="lab-offer-desc">{o.desc}</p>
                <button className="lab-offer-btn" onClick={() => scrollToBooking("")}>Book now</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-10 md:py-14 section-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="section-title">Patient Reviews</h2>
          <p className="section-subtitle mt-2">What patients say about our experience.</p>

          <div className="lab-review mt-10">
            <button
              className="lab-review-nav"
              onClick={() => setReviewIndex((i) => (i - 1 + reviews.length) % reviews.length)}
              aria-label="Previous review"
            >
              ‹
            </button>

            <div className="lab-review-card">
              <img className="lab-review-photo" src={reviews[reviewIndex].photo} alt={reviews[reviewIndex].name} />
              <div>
                <div className="lab-review-name">{reviews[reviewIndex].name}</div>
                <div className="lab-stars" aria-label={`Rating ${reviews[reviewIndex].rating} out of 5`}>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <span key={idx} className={idx < reviews[reviewIndex].rating ? "lab-star lab-star--on" : "lab-star"}>
                      ★
                    </span>
                  ))}
                </div>
                <p className="lab-review-text">{reviews[reviewIndex].review}</p>
              </div>
            </div>

            <button
              className="lab-review-nav"
              onClick={() => setReviewIndex((i) => (i + 1) % reviews.length)}
              aria-label="Next review"
            >
              ›
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="section-title">FAQ</h2>
          <p className="section-subtitle mt-2">Clear answers to help you book confidently.</p>

          <div className="lab-faq mt-10">
            {faqs.map((item, idx) => {
              const open = faqOpen === idx;
              return (
                <div key={item.q} className={`lab-faq-item ${open ? "lab-faq-item--open" : ""}`}>
                  <button
                    className="lab-faq-q"
                    onClick={() => setFaqOpen(open ? null : idx)}
                    aria-expanded={open}
                  >
                    <span>{item.q}</span>
                    <span className="lab-faq-icon">{open ? "–" : "+"}</span>
                  </button>
                  <div className="lab-faq-a" style={{ display: open ? "block" : "none" }}>
                    {item.a}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BOOKING (existing functionality preserved) */}
      <section className="pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={bookingRef}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
            <div className="bg-white shadow-2xl rounded-[35px] p-5 sm:p-7 md:p-10 border border-green-100">
              <p className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center">
                Book Appointment
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <select
                  {...register("labtest")}
                  className="w-full p-3 md:p-4 rounded-2xl border border-gray-300 outline-none focus:border-green-500 shadow-sm"
                >
                  <option value="">Select Lab Test</option>
                  <option value="CBC">Complete Blood Count (CBC)</option>
                  <option value="Blood Sugar">Blood Sugar Test</option>
                  <option value="Thyroid">Thyroid Profile</option>
                  <option value="Lipid">Lipid Profile</option>
                  <option value="Full Body Checkup">Full Body Checkup</option>
                </select>

                <input
                  type="text"
                  placeholder="Enter your name"
                  {...register("name")}
                  className="w-full p-3 md:p-4 rounded-2xl border border-gray-300 outline-none focus:border-green-500 shadow-sm"
                />

                <input
                  type="number"
                  placeholder="Enter your age"
                  {...register("age")}
                  className="w-full p-3 md:p-4 rounded-2xl border border-gray-300 outline-none focus:border-green-500 shadow-sm"
                />

                <input
                  type="tel"
                  placeholder="Enter your contact no"
                  {...register("phone")}
                  className="w-full p-3 md:p-4 rounded-2xl border border-gray-300 outline-none focus:border-green-500 shadow-sm"
                />

                <input
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  className="w-full p-3 md:p-4 rounded-2xl border border-gray-300 outline-none focus:border-green-500 shadow-sm"
                />

                <select
                  {...register("time")}
                  className="w-full p-3 md:p-4 rounded-2xl border border-gray-300 outline-none focus:border-green-500 shadow-sm"
                >
                  <option value="">Select Time Slot</option>
                  <option value="08:00 AM">08:00 AM</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>

                <div className="flex justify-center pt-4">
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white rounded-2xl px-8 md:px-10 py-3 md:py-4 font-semibold shadow-lg hover:scale-105 transition duration-300"
                  >
                    Book Test
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-[35px] shadow-2xl p-5 sm:p-7 md:p-8 border border-green-100">
              <p className="text-2xl md:text-3xl font-bold text-center mb-8">
                Choose Appointment Date
              </p>

              <div className="flex justify-center overflow-x-auto">
                <Calendar onChange={setDate} value={date} className="react-calendar" />
              </div>

              <div className="mt-6 md:mt-8 bg-green-50 rounded-3xl p-4 md:p-6 text-center">
                <p className="text-lg md:text-xl font-semibold mb-2">Selected Date</p>
                <p className="text-green-700 text-base md:text-lg font-bold">
                  {date.toDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Labtest;

