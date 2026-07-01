import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaLeaf,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
  FaArrowRight,
  FaShieldAlt,
  FaTruck,
  FaUndo,
  FaHeadset,
} from "react-icons/fa";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3500);
  };

  return (
    <footer className="bg-[var(--neutral-900)] text-neutral-300 mt-auto w-full">
      {/* Trust strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: <FaTruck />, title: "Free Delivery", sub: "On orders above ₹499" },
            { icon: <FaShieldAlt />, title: "100% Genuine", sub: "Verified medicines only" },
            { icon: <FaUndo />, title: "Easy Returns", sub: "Hassle-free refunds" },
            { icon: <FaHeadset />, title: "24/7 Support", sub: "Expert help anytime" },
          ].map((it, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl bg-[var(--brand-600)]/15
                           flex items-center justify-center text-[var(--brand-400)]
                           text-lg shrink-0"
              >
                {it.icon}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{it.title}</p>
                <p className="text-neutral-400 text-xs">{it.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-gradient-to-r from-[var(--brand-700)] to-[var(--brand-900)]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-12
                        flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-white text-xl md:text-2xl font-bold mb-1">
              Get health tips & exclusive offers
            </h3>
            <p className="text-[var(--brand-100)] text-sm">
              Join 25,000+ subscribers. Unsubscribe anytime.
            </p>
          </div>

          <form
            onSubmit={handleSubscribe}
            className="w-full md:w-auto flex items-center gap-2
                       bg-white/10 backdrop-blur p-1.5 rounded-full
                       border border-white/20"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 md:w-72 bg-transparent outline-none
                         text-white placeholder-white/60
                         px-4 py-2 text-sm"
            />
            <button
              type="submit"
              className="bg-white text-[var(--brand-700)] font-semibold
                         px-5 py-2.5 rounded-full text-sm
                         hover:bg-[var(--brand-50)] transition
                         flex items-center gap-2 whitespace-nowrap"
            >
              {subscribed ? "Subscribed ✓" : (
                <>
                  Subscribe
                  <FaArrowRight className="text-xs" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-14 md:py-16
                      grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-11 h-11 rounded-full
                         bg-gradient-to-br from-[var(--brand-400)] to-[var(--brand-700)]
                         flex items-center justify-center shadow-lg shadow-[var(--brand-700)]/30"
            >
              <FaLeaf className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Dr. Kent</h2>
              <p className="tracking-[3px] text-xs text-[var(--brand-300)] font-semibold">
                HOMOEOPHARMACY
              </p>
            </div>
          </div>

          <p className="leading-7 text-sm md:text-base text-neutral-400 mb-6 max-w-md">
            Your trusted destination for authentic homoeopathic medicines
            and expert consultations. Serving the community for over 25 years
            with care, integrity, and proven results.
          </p>

          {/* Socials */}
          <div className="flex flex-wrap gap-3">
            {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="social link"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-[var(--brand-600)]
                           flex items-center justify-center text-neutral-300 hover:text-white
                           transition hover:-translate-y-0.5"
              >
                <Icon className="text-sm" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-bold text-base mb-5 uppercase tracking-wider">
            Quick Links
          </h3>
          <ul className="space-y-3 text-sm">
            {[
              { to: "/", label: "About Us" },
              { to: "/Products", label: "Products" },
              { to: "/Consult", label: "Book Appointment" },
              { to: "/Consult", label: "Online Consultation" },
              { to: "/Cart", label: "Track Order" },
              { to: "/", label: "Blog" },
            ].map((l, i) => (
              <li key={i}>
                <Link
                  to={l.to}
                  className="text-neutral-400 hover:text-[var(--brand-300)] transition inline-flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-[var(--brand-500)] group-hover:w-3 transition-all" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-white font-bold text-base mb-5 uppercase tracking-wider">
            Categories
          </h3>
          <ul className="space-y-3 text-sm">
            {[
              "Dilutions",
              "Mother Tinctures",
              "Biochemic Salts",
              "Tonics & Syrups",
              "External Applications",
              "Wellness Products",
            ].map((c, i) => (
              <li key={i}>
                <a
                  href="#"
                  className="text-neutral-400 hover:text-[var(--brand-300)] transition inline-flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-[var(--brand-500)] group-hover:w-3 transition-all" />
                  {c}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-bold text-base mb-5 uppercase tracking-wider">
            Contact Us
          </h3>
          <div className="space-y-4 text-sm text-neutral-400">
            <div className="flex gap-3 items-start">
              <FaMapMarkerAlt className="text-[var(--brand-400)] mt-1 shrink-0" />
              <p>42 Wellness Lane, Green Park, New Delhi - 110016</p>
            </div>

            <div className="flex gap-3 items-center">
              <FaPhoneAlt className="text-[var(--brand-400)] shrink-0" />
              <a href="tel:+919876543210" className="hover:text-[var(--brand-300)]">
                +91 98765 43210
              </a>
            </div>

            <div className="flex gap-3 items-center break-all">
              <FaEnvelope className="text-[var(--brand-400)] shrink-0" />
              <a href="mailto:care@drkenthomoeo.com" className="hover:text-[var(--brand-300)]">
                care@drkenthomoeo.com
              </a>
            </div>

            <div className="flex gap-3 items-start">
              <FaClock className="text-[var(--brand-400)] mt-1 shrink-0" />
              <p>
                Mon - Sat: 9 AM - 8 PM
                <br />
                Sunday: Closed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div
          className="max-w-7xl mx-auto px-6 md:px-10 py-6
                     flex flex-col md:flex-row justify-between items-center
                     gap-4 text-center md:text-left"
        >
          <p className="text-sm text-neutral-400">
            © 2026 Dr. Kent Homoeo Pharmacy. All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-5 md:gap-7 text-sm">
            {["Privacy Policy", "Terms of Service", "Refund Policy", "Sitemap"].map((t, i) => (
              <a
                key={i}
                href="#"
                className="text-neutral-400 hover:text-[var(--brand-300)] transition"
              >
                {t}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
