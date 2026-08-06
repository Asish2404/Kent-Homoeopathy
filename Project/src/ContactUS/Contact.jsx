import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
  FaWhatsapp,
  FaInstagram,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaCommentDots,
  FaCheckCircle,
  FaHeadset,
  FaShieldAlt,
  FaQuestionCircle,
  FaChevronDown,
  FaLeaf,
  FaStethoscope,
  FaHeart,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FiArrowRight, FiPhone, FiMail, FiMessageSquare } from "react-icons/fi";
import { HiOutlineMailOpen, HiOutlineLocationMarker } from "react-icons/hi";
import FAQ from "./FAQ";
import contactCards from "./ContactCards";
/* -------- Inline reusable bits (kept local to the component) -------- */

const Field = ({ label, error, children, required }) => (
  <div>
    <label className="block text-sm font-semibold text-neutral-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const inputBase =
  "w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 " +
  "outline-none text-neutral-800 placeholder:text-neutral-400 " +
  "transition focus:bg-white focus:border-[var(--brand-400)] " +
  "focus:ring-2 focus:ring-[var(--brand-100)]";



const Contact = () => {
  const subjectRef = useRef(null);
  const messageRef = useRef(null);

  const quickTopicOptions = [
    "Book a consultation",
    "Ask about a medicine",
    "Help with an order",
    "Report a quality issue",
  ];

  const handleQuickTopic = (topic) => {
    // 1) Replace subject (even if it already has text)
    setValue("subject", topic, { shouldDirty: true, shouldValidate: true });

    // 3) Smoothly scroll to Subject field (if needed)
    if (subjectRef.current) {
      subjectRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      subjectRef.current.focus();
    }

    // 4) After Subject is filled, move focus to Message textarea
    // react-hook-form setValue is sync for the input value, but DOM focus timing varies,
    // so we schedule next tick.
    setTimeout(() => {
      if (messageRef.current) messageRef.current.focus();
    }, 0);
  };
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    reset,
  } = useForm();

  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const onSubmit = (data) => {
    // Original behaviour preserved — log to console.
    console.log(data);
    setSubmitted(true);
    reset();
    setTimeout(() => setSubmitted(false), 4500);
  };



  const socials = [
    { Icon: FaFacebookF, color: "hover:bg-[#1877F2]", label: "Facebook" },
    { Icon: FaXTwitter, color: "hover:bg-black", label: "X" },
    { Icon: FaLinkedinIn, color: "hover:bg-[#0a66c2]", label: "LinkedIn" },
    { Icon: FaYoutube, color: "hover:bg-[#FF0000]", label: "YouTube" },
    { Icon: FaWhatsapp, color: "hover:bg-[#25d366]", label: "WhatsApp" },
    { Icon: FaInstagram, color: "hover:bg-[#c32aa3]", label: "Instagram" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ============== HERO ============== */}
      <section className="relative overflow-hidden">
        {/* Decorative background */}
        <div
          className="absolute inset-0
                     bg-gradient-to-br from-[var(--brand-50)] via-white to-[var(--accent-sage)]"
        />
        <div
          className="absolute -top-32 -right-32 w-[28rem] h-[28rem]
                     rounded-full bg-[var(--brand-200)]/50 blur-3xl"
        />
        <div
          className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem]
                     rounded-full bg-emerald-200/40 blur-3xl"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-12 md:pb-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left content */}
            <div className="animate-fade-up">
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                           bg-white border border-[var(--brand-200)]
                           text-[var(--brand-700)] text-sm font-semibold
                           shadow-sm"
              >
                <FaHeadset className="text-xs" />
                24/7 Support Available
              </span>

              <h1
                className="mt-5 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold
                           text-neutral-900 leading-[1.05] tracking-tight
                           font-['Plus_Jakarta_Sans']"
              >
                Let's talk
                <br />
                <span className="brand-gradient-text">healthcare.</span>
              </h1>

              <p className="mt-6 text-base md:text-lg text-neutral-600 leading-relaxed max-w-xl">
                Whether it's a question about medicines, an appointment, or just
                a friendly chat — our care team is one message away.
              </p>

              {/* Quick action chips */}
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="tel:08910863893"
                  className="btn-primary text-sm"
                >
                  <FiPhone />
                  Call Us
                </a>
                <a
                  href="mailto:care@drkenthomoeo.com"
                  className="btn-outline text-sm"
                >
                  <FiMail />
                  Email Us
                </a>
                <a
                  href="https://wa.me/08910863893"
                  className="btn-outline text-sm"
                  style={{ borderColor: "#bbf7d0", color: "#15803d" }}
                >
                  <FaWhatsapp />
                  WhatsApp
                </a>
              </div>

              {/* Trust line */}
              <div
                className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2
                           text-sm text-neutral-500"
              >
                <span className="inline-flex items-center gap-2">
                  <FaShieldAlt className="text-[var(--brand-600)]" />
                  100% Secure
                </span>
                <span className="inline-flex items-center gap-2">
                  <FaCheckCircle className="text-[var(--brand-600)]" />
                  Verified Team
                </span>
                <span className="inline-flex items-center gap-2">
                  <FaHeart className="text-[var(--brand-600)]" />
                  25K+ Happy Patients
                </span>
              </div>
            </div>

            {/* Right — visual collage */}
            <div className="relative animate-fade-in">
              <div className="relative grid grid-cols-2 gap-4">
                {/* Big card */}
                <div
                  className="col-span-2 aspect-[16/10] rounded-3xl overflow-hidden
                             shadow-2xl border border-white
                             relative bg-white"
                >
                  <img
                    src="https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=1200&auto=format&fit=crop"
                    alt="Healthcare professional"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-xs font-semibold tracking-widest opacity-80">
                      DR. KENT TEAM
                    </p>
                    <p className="text-lg font-bold mt-0.5">
                      Always here for you
                    </p>
                  </div>
                </div>

                {/* Small card 1 */}
                <div
                  className="aspect-square rounded-3xl overflow-hidden shadow-xl
                             border border-white relative bg-white"
                >
                  <img
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop"
                    alt="Medicines"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Small card 2 — stat */}
                <div
                  className="aspect-square rounded-3xl p-5 shadow-xl
                             bg-gradient-to-br from-[var(--brand-600)] to-[var(--brand-800)]
                             text-white flex flex-col justify-between"
                >
                  <FaStethoscope className="text-3xl opacity-80" />
                  <div>
                    <p className="text-3xl font-extrabold">25+</p>
                    <p className="text-sm opacity-90">Years of care</p>
                  </div>
                </div>
              </div>

              {/* Floating chip */}
              <div
                className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-xl
                           p-3 pr-4 flex items-center gap-2 border border-neutral-100
                           animate-float"
              >
                <div className="w-9 h-9 rounded-xl bg-[var(--brand-100)] text-[var(--brand-700)] flex items-center justify-center">
                  <FaLeaf />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Avg. response</p>
                  <p className="text-sm font-bold text-neutral-800">Under 5 min</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== CONTACT INFO CARDS ============== */}
      <section className="relative -mt-8 md:-mt-12 z-10 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {contactCards.map((c, i) => {
              const Inner = (
                <div
                  className={`relative overflow-hidden
                              bg-gradient-to-br ${c.tone}
                              text-white p-6 rounded-2xl
                              shadow-lg shadow-[var(--brand-700)]/20
                              hover:shadow-2xl card-lift h-full`}
                >
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                  <div
                    className="relative w-12 h-12 rounded-xl bg-white/15 backdrop-blur
                               flex items-center justify-center text-xl mb-4"
                  >
                    {c.icon}
                  </div>
                  <p className="text-xs font-semibold tracking-widest opacity-80 uppercase">
                    {c.title}
                  </p>
                  <p className="mt-1.5 text-base font-semibold leading-snug">
                    Primary : {c.primary}
                  </p>
                  <p className="text-sm opacity-90">{c.secondary}</p>
                </div>
              );
              return c.link ? (
                <a
                  key={i}
                  href={c.link}
                  className="block animate-fade-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {Inner}
                </a>
              ) : (
                <div
                  key={i}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {Inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============== FORM + HELP INFO ============== */}
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form card */}
          <div
            className="lg:col-span-3
                       bg-white border border-neutral-100
                       rounded-3xl shadow-xl
                       p-6 md:p-10 animate-fade-up"
          >
            <div className="flex items-center gap-3 mb-2">
              <span
                className="w-11 h-11 rounded-xl
                           bg-[var(--brand-100)] text-[var(--brand-700)]
                           flex items-center justify-center text-lg"
              >
                <FiMessageSquare />
              </span>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
                  Send us a message
                </h2>
                <p className="text-sm text-neutral-500">
                  We typically reply within a few hours.
                </p>
              </div>
            </div>

            {submitted && (
              <div
                className="mt-6 mb-2 p-4 rounded-xl
                           bg-[var(--brand-50)] border border-[var(--brand-200)]
                           text-[var(--brand-800)]
                           flex items-center gap-3 animate-fade-in"
              >
                <FaCheckCircle className="text-xl shrink-0" />
                <div>
                  <p className="font-semibold">Message sent!</p>
                  <p className="text-sm opacity-80">
                    Our team will reach out to you shortly.
                  </p>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5"
            >
              <Field label="Full Name" required error={errors.name?.message}>
                <input
                  type="text"
                  placeholder="John Doe"
                  className={inputBase}
                  {...register("name", { required: "Name is required" })}
                />
              </Field>

              <Field label="Email Address" required error={errors.email?.message}>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={inputBase}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Enter a valid email",
                    },
                  })}
                />
              </Field>

              <Field label="Phone Number" required error={errors.phone?.message}>
                <input
                  type="tel"
                  placeholder="+91 91234 56789"
                  className={inputBase}
                  {...register("phone", { required: "Phone is required" })}
                />
              </Field>

              <Field label="Subject" required error={errors.subject?.message}>
                <input
                  ref={subjectRef}
                  type="text"
                  placeholder="How can we help?"
                  className={inputBase}
                  {...register("subject", { required: "Subject is required" })}
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Message" required error={errors.message?.message}>
                  <textarea
                    ref={messageRef}
                    rows={5}
                    placeholder="Tell us a little about your query..."
                    className={`${inputBase} resize-none`}
                    {...register("message", { required: "Message cannot be empty" })}
                  />
                </Field>
              </div>

              <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-3 mt-2">
                <button type="submit" className="btn-primary w-full sm:w-auto px-8 py-3.5">
                  <FaPaperPlane className="text-sm" />
                  Send Message
                </button>
                <p className="text-xs text-neutral-500 sm:ml-auto">
                  By submitting, you agree to our{" "}
                  <a href="#" className="text-[var(--brand-700)] font-semibold hover:underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </form>
          </div>

          {/* Side info */}
          <div className="lg:col-span-2 space-y-5">
            <div
              className="bg-white border border-neutral-100 rounded-3xl
                         shadow-sm p-6 md:p-7 animate-fade-up"
            >
              <h3 className="text-lg font-bold text-neutral-900 mb-1">
                Why reach out?
              </h3>
              <p className="text-sm text-neutral-500 mb-5">
                We're here to help with any of these.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: <FaStethoscope />, t: "Book a consultation" },
                  { icon: <FaLeaf />, t: "Ask about a medicine" },
                  { icon: <FaCommentDots />, t: "Help with an order" },
                  { icon: <FaShieldAlt />, t: "Report a quality issue" },
                ].map((it, i) => (
                  <li
                    key={i}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleQuickTopic(it.t)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleQuickTopic(it.t);
                      }
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl
                               bg-[var(--brand-50)] hover:bg-[var(--brand-100)]
                               transition cursor-pointer"
                  >
                    <span
                      className="w-9 h-9 rounded-lg
                                 bg-white text-[var(--brand-700)]
                                 flex items-center justify-center shadow-sm"
                    >
                      {it.icon}
                    </span>
                    <span className="text-sm font-medium text-neutral-700">
                      {it.t}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="bg-gradient-to-br from-[var(--brand-600)] to-[var(--brand-800)]
                         text-white rounded-3xl p-6 md:p-7
                         shadow-xl relative overflow-hidden animate-fade-up"
              style={{ animationDelay: "120ms" }}
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
              <FaHeadset className="text-3xl opacity-80 mb-3" />
              <h3 className="text-xl font-bold">Need urgent help?</h3>
              <p className="text-sm opacity-90 mt-1.5">
                Our 24/7 helpline connects you to a care specialist in seconds.
              </p>
              <a
                href="tel:08910863893"
                className="mt-5 inline-flex items-center gap-2
                           bg-white text-[var(--brand-700)] font-semibold
                           px-5 py-2.5 rounded-xl
                           hover:bg-[var(--brand-50)] transition"
              >
                <FiPhone /> 08910863893 
                <FiArrowRight />
              </a>
            </div>

            {/* Socials */}
            <div
              className="bg-white border border-neutral-100 rounded-3xl
                         shadow-sm p-6 md:p-7 animate-fade-up"
              style={{ animationDelay: "180ms" }}
            >
              <h3 className="text-base font-bold text-neutral-900 mb-1">
                Follow us
              </h3>
              <p className="text-sm text-neutral-500 mb-4">
                Health tips, offers & updates.
              </p>
              <div className="flex flex-wrap gap-2.5">
                {socials.map(({ Icon, color, label }, i) => (
                  <a
                    key={i}
                    href="#"
                    aria-label={label}
                    className={`w-11 h-11 rounded-xl
                                bg-neutral-100 text-neutral-600
                                flex items-center justify-center
                                hover:text-white ${color}
                                transition hover:-translate-y-0.5`}
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== MAP ============== */}
      <section id="map" className="px-4 pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
            <div>
              <span className="section-eyebrow">Find us</span>
              <h2 className="section-title mt-3">Visit our office</h2>
            </div>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noreferrer"
              className="btn-outline text-sm py-2.5"
            >
              <HiOutlineLocationMarker /> Get Directions
            </a>
          </div>

          <div
            className="relative rounded-3xl overflow-hidden
                       border border-neutral-100 shadow-xl
                       h-[320px] sm:h-[400px] md:h-[480px] bg-white"
          >
            <iframe
              title="Dr. Kent Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3680.789621021495!2d88.38324487534814!3d22.69887427940197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f89df16c9a6e15%3A0x7069433119c1932a!2sDr.%20Kent%20Homoeo%20Pharmacy!5e0!3m2!1sen!2sin!4v1783595660031!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />

            {/* Floating info card */}
            <div
              className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6
                         bg-white rounded-2xl shadow-2xl
                         p-4 sm:p-5 max-w-xs border border-neutral-100
                         animate-fade-up"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl
                             bg-[var(--brand-100)] text-[var(--brand-700)]
                             flex items-center justify-center shrink-0"
                >
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <p className="font-bold text-neutral-900">Dr. Kent HQ</p>
                  <p className="text-sm text-neutral-500 leading-snug mt-0.5">
                    1st floor, 9, Barasat Rd, above hdfc bank, Burmah Shell Colony, Sodepur, Kolkata
                    <br />
                    West Bengal 700110
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== FAQ ============== */}
      <section className="px-4 pb-20 md:pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="section-eyebrow">FAQs</span>
            <h2 className="section-title mt-3">
              Frequently asked <span className="brand-gradient-text">questions</span>
            </h2>
            <p className="section-subtitle">
              Quick answers to the things most patients ask.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ.map((item, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={i}
                  className={`bg-white border rounded-2xl overflow-hidden
                              transition shadow-sm
                              ${open
                      ? "border-[var(--brand-200)] shadow-md"
                      : "border-neutral-100 hover:border-[var(--brand-100)]"
                    }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-center justify-between gap-4
                               text-left p-4 md:p-5"
                    aria-expanded={open}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                                    ${open
                            ? "bg-[var(--brand-600)] text-white"
                            : "bg-[var(--brand-50)] text-[var(--brand-700)]"
                          } transition`}
                      >
                        <FaQuestionCircle />
                      </span>
                      <span className="font-semibold text-neutral-800 text-sm md:text-base">
                        {item.q}
                      </span>
                    </span>
                    <FaChevronDown
                      className={`text-neutral-500 transition-transform ${open ? "rotate-180 text-[var(--brand-700)]" : ""
                        }`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out
                                ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-4 md:px-5 pb-5 text-sm text-neutral-600 leading-relaxed
                                    pl-[3.75rem] md:pl-[3.75rem]">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
