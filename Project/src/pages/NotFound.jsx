import { Link } from "react-router-dom";
import { FaLeaf } from "react-icons/fa";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="max-w-md w-full text-center">
        {/* Brand icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-[var(--brand-50)] border border-[var(--brand-100)] flex items-center justify-center">
          <FaLeaf className="w-10 h-10 text-[var(--brand-600)]" />
        </div>

        {/* Error code */}
        <h1 className="text-8xl font-black text-neutral-200 mb-2">404</h1>

        {/* Message */}
        <h2 className="text-2xl font-extrabold text-neutral-900 mb-2">
          Page not found
        </h2>
        <p className="text-neutral-500 mb-8 leading-relaxed max-w-sm mx-auto">
          The page you are looking for doesn't exist or has been moved. Let us
          help you find the right remedy.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary px-6 py-3">
            Go Home
          </Link>
          <Link to="/Products" className="btn-outline px-6 py-3">
            Browse Products
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-10 pt-8 border-t border-neutral-100">
          <p className="text-sm text-neutral-500 mb-4 font-semibold">
            Popular pages
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { to: "/Products", label: "Products" },
              { to: "/Consult", label: "Consult Doctor" },
              { to: "/Labtest", label: "Lab Tests" },
              { to: "/Contact", label: "Contact Us" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 rounded-full bg-white border border-neutral-200 text-sm font-semibold text-neutral-700 hover:border-[var(--brand-200)] hover:text-[var(--brand-700)] transition"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

