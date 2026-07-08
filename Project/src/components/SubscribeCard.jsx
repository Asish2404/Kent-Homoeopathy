import { useState } from "react";
import { FaEnvelope, FaArrowRight } from "react-icons/fa";
import Illustration from "../assets/Kent.png";

export default function SubscribeCard({ onSubscribe }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setStatus("Please enter an email");
      return;
    }
    setStatus("Subscribed ✓");
    setEmail("");
    setTimeout(() => setStatus(""), 3000);
    if (onSubscribe) onSubscribe(email);
  };

  return (
    <div className="w-full md:max-w-xl bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-6 flex items-center gap-4">
      <img src={Illustration} alt="health" className="bg-white hidden md:block w-20 h-20 rounded-lg object-cover z-50" />
      <div className="flex-1">
        <h4 className="text-white font-bold text-lg">Join our Wellness Newsletter</h4>
        <p className="text-[var(--brand-100)] text-sm">Premium health tips, early access to offers, and doctor insights.</p>

        <form onSubmit={handleSubmit} className="mt-3 flex gap-2" aria-label="Subscribe to newsletter">
          <label htmlFor="subscribe-email" className="sr-only">Email address</label>
          <input
            id="subscribe-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 bg-transparent outline-none text-white placeholder-white/60 px-4 py-2 rounded-lg border border-white/10"
            aria-required="true"
          />
          <button aria-label="Subscribe" type="submit" className="bg-white text-[var(--brand-700)] px-4 py-2 rounded-lg font-semibold hover:opacity-95">
            {status || <FaArrowRight />}
          </button>
        </form>
        {status && <p className="mt-2 text-sm text-emerald-200">{status}</p>}
      </div>
    </div>
  );
}
