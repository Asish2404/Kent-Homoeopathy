import { useState } from "react";
import {
  Search,
  UserRound,
  Video,
  Star,
  Clock3,
  Filter,
  Stethoscope,
} from "lucide-react";
import doctors from "./Doctor.js";
function Consult() {
  const [mode, setMode] = useState("visit");
  const [query, setQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [speciality, setSpeciality] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [booking, setBooking] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    symptoms: "",
  });
  const [bookingMessage, setBookingMessage] = useState("");
  const [activeFaq, setActiveFaq] = useState(0);

  // const specialityCards = [
  //   { title: "General Physician", desc: "Primary care and everyday consultation", icon: <Stethoscope size={20} /> },
  //   { title: "Cardiologist", desc: "Heart health and cardiovascular care", icon: <Star size={20} /> },
  //   { title: "Dermatologist", desc: "Skin, hair, and allergy support", icon: <Filter size={20} /> },
  //   { title: "Neurologist", desc: "Nervous system and headache care", icon: <UserRound size={20} /> },
  //   { title: "Dentist", desc: "Oral care and hygiene consultation", icon: <Clock3 size={20} /> },
  //   { title: "Orthopedic", desc: "Bone, joint, and mobility support", icon: <UserRound size={20} /> },
  //   { title: "ENT", desc: "Ear, nose, and throat consultations", icon: <Video size={20} /> },
  //   { title: "Gynecologist", desc: "Women’s health and wellness", icon: <Stethoscope size={20} /> },
  //   { title: "Pediatrician", desc: "Care for children and newborns", icon: <UserRound size={20} /> },
  //   { title: "Psychiatrist", desc: "Emotional health and support", icon: <Star size={20} /> },
  // ];

  const whyCards = [
    "Verified Doctors",
    "Instant Consultation",
    "Digital Prescription",
    "Experienced Specialists",
    "24x7 Support",
    "Secure Consultation",
  ];

  const processSteps = [
    { step: "1", title: "Choose Doctor", desc: "Pick a specialist that matches your concern." },
    { step: "2", title: "Book Appointment", desc: "Schedule your preferred date to get started." },
    { step: "3", title: "Video Consultation", desc: "Connect securely from any device." },
    { step: "4", title: "Receive Prescription", desc: "Get a clear digital prescription instantly." },
  ];

  const reviews = [
    { name: "Aarav Mehta", doctor: "Dr. Ananya Sen", date: "12 Jun 2026", rating: 5, text: "The consultation was calm, precise, and reassuring. The booking flow was quick and the doctor was highly attentive.", image: "https://i.pravatar.cc/100?img=12" },
    { name: "Neha Sharma", doctor: "Dr. Priya Roy", date: "05 Jun 2026", rating: 5, text: "Clean interface, timely appointment, and a very professional consultation experience overall.", image: "https://i.pravatar.cc/100?img=32" },
    { name: "Rohit Das", doctor: "Dr. Raj Mehta", date: "28 May 2026", rating: 4, text: "Very easy to use on mobile. The doctor was thorough and the prescription arrived immediately.", image: "https://i.pravatar.cc/100?img=45" },
  ];

  const faqs = [
    { q: "How do I book a consultation?", a: "Search by doctor or speciality, choose a time slot, and confirm the appointment." },
    { q: "Will I get a prescription?", a: "Yes, a digital prescription is generated after the consultation when required." },
    { q: "Can I consult on mobile?", a: "Yes, the page and consultation flow are fully responsive across mobile and desktop." },
  ];

  const specialities = ["all", ...new Set(doctors.map((doc) => doc.speciality))];
  const featuredHighlights = [
    { label: "Verified doctors", value: "2,000+" },
    { label: "Avg. response", value: "< 10 min" },
    { label: "Secure consults", value: "24x7" },
  ];

  const filteredDoctors = doctors.filter((doc) => {
    const search = query.trim().toLowerCase();
    const locationSearch = locationQuery.trim().toLowerCase();
    const matchesSearch =
      !search ||
      [doc.name, doc.speciality, doc.qualification, doc.clinic].some((value) =>
        String(value || "").toLowerCase().includes(search)
      );
    const matchesLocation =
      !locationSearch ||
      String(doc.clinic || "").toLowerCase().includes(locationSearch);
    const matchesSpeciality = speciality === "all" || doc.speciality === speciality;
    return matchesSearch && matchesLocation && matchesSpeciality;
  });

  const handleBook = () => {
    if (!booking.name || !booking.email || !booking.phone || !booking.date) {
      setBookingMessage("Please complete the required fields.");
      return;
    }

    const existing = JSON.parse(localStorage.getItem("profile_appointments_v1") || "[]");
    const next = [
      ...existing,
      {
        id: `APT-${Date.now()}`,
        doctor: selectedDoctor?.name || "Specialist Consultation",
        speciality: selectedDoctor?.speciality || "Consultation",
        date: booking.date,
        mode,
        status: "Upcoming",
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        symptoms: booking.symptoms,
      },
    ];

    localStorage.setItem("profile_appointments_v1", JSON.stringify(next));
    setBookingMessage("Appointment booked successfully.");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <section className="relative overflow-hidden" id="consultancy">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-green-50" />
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-emerald-200/35 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-green-200/35 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
            <div className="space-y-7 animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/85 px-5 py-2 text-sm font-semibold text-green-700 shadow-sm backdrop-blur">
                <Stethoscope size={16} />
                Premium online consultation
              </span>

              <div className="max-w-2xl space-y-4">
                <h1 className="text-4xl font-extrabold leading-[1.02] tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
                  Book trusted doctors with a calmer, more premium healthcare experience.
                </h1>
                <p className="max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                  Search by doctor, speciality, or location, choose a convenient slot, and connect with specialists through a clean consultation flow built for modern care.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {featuredHighlights.map((item) => (
                  <div key={item.label} className="rounded-[22px] border border-slate-100 bg-white/90 px-4 py-4 shadow-sm backdrop-blur">
                    <p className="text-xl font-bold text-slate-900">{item.value}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* <div className="rounded-[28px] border border-emerald-100 bg-white/90 p-4 shadow-[0_18px_50px_rgba(16,185,129,0.10)] backdrop-blur sm:p-5">
                <div className="grid items-center gap-3 sm:grid-cols-[1.1fr_1fr] lg:grid-cols-[1.2fr_1fr_1fr_auto]">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition focus-within:border-green-300 focus-within:bg-white">
                    <Search size={18} className="shrink-0 text-green-600" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search doctor name"
                      className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition focus-within:border-green-300 focus-within:bg-white">
                    <Stethoscope size={18} className="shrink-0 text-green-600" />
                    <select
                      value={speciality}
                      onChange={(e) => setSpeciality(e.target.value)}
                      className="w-full bg-transparent outline-none text-slate-700"
                    >
                      <option value="all">Search by speciality</option>
                      {specialities.filter((item) => item !== "all").map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition focus-within:border-green-300 focus-within:bg-white">
                    <Filter size={18} className="shrink-0 text-green-600" />
                    <input
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      placeholder="Location"
                      className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                    />
                  </div>
                  <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-6 py-4 font-semibold text-white shadow-lg shadow-green-200 transition hover:-translate-y-0.5 hover:bg-green-700">
                    Search
                  </button>
                </div>
              </div> */}



              {/* <div className="flex flex-wrap items-center gap-3">
                <a href="#book-appointment" className="inline-flex items-center justify-center rounded-2xl bg-green-600 px-8 py-4 font-semibold text-white shadow-lg shadow-green-200 transition hover:-translate-y-0.5 hover:bg-green-700">
                  Book Appointment
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setLocationQuery("");
                    setSpeciality("all");
                  }}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-8 py-4 font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
                >
                  Reset search
                </button>
              </div> */}
            </div>

            <div className="relative animate-fade-up">
              <div className="absolute -inset-6 rounded-[40px] bg-emerald-200/35 blur-3xl" />
              <div className="relative overflow-hidden rounded-[34px] border border-white bg-white shadow-[0_30px_80px_rgba(15,23,42,0.16)]">
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1600&auto=format&fit=crop"
                  alt="doctor consultation"
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover md:aspect-[5/4]"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/25 via-transparent to-transparent" />

                <div className="absolute left-4 top-4 rounded-full border border-white/50 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-green-700 shadow-lg backdrop-blur">
                  Trusted care
                </div>

                <div className="absolute bottom-4 left-4 right-4 rounded-[24px] border border-white/60 bg-white/88 p-4 shadow-xl backdrop-blur">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">24x7 Support</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">Premium consultation booking</p>
                      <p className="mt-1 text-sm text-slate-600">Modern scheduling, fast access, and secure follow-up support.</p>
                    </div>
                    <div className="flex shrink-0 -space-x-2">
                      <img src="https://i.pravatar.cc/80?img=14" alt="patient" className="h-10 w-10 rounded-full border-2 border-white object-cover" />
                      <img src="https://i.pravatar.cc/80?img=24" alt="patient" className="h-10 w-10 rounded-full border-2 border-white object-cover" />
                      <img src="https://i.pravatar.cc/80?img=34" alt="patient" className="h-10 w-10 rounded-full border-2 border-white object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 max-w-7xl px-4 sm:px-6">
        <div className=" rounded-[30px] border border-emerald-100 bg-white p-4 shadow-[0_18px_50px_rgba(16,185,129,0.10)] md:p-5">
          <div className="flex flex-wrap gap-2 pb-5 justify-center">
            {specialities.map((item) => (
              <button
                key={item}
                onClick={() => setSpeciality(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${speciality === item ? "bg-green-600 text-white shadow-lg shadow-green-200" : "border border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-green-200 hover:bg-green-50 hover:text-green-700"}`}
              >
                {item === "all" ? "All specialities" : item}
              </button>
            ))}
          </div>
          <div className="grid items-center gap-4 md:grid-cols-[1.3fr_1fr_1fr_auto]">
            <div className="flex items-center gap-3 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 transition focus-within:border-green-300 focus-within:bg-white">
              <Search size={18} className="shrink-0 text-green-600" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Doctor name"
                className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-3 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 transition focus-within:border-green-300 focus-within:bg-white">
              <Stethoscope size={18} className="shrink-0 text-green-600" />
              <select
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
                className="w-full bg-transparent outline-none text-slate-700"
              >
                <option value="all">All specialities</option>
                {specialities.filter((item) => item !== "all").map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 transition focus-within:border-green-300 focus-within:bg-white">
              <Filter size={18} className="shrink-0 text-green-600" />
              <input
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Location"
                className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-[20px] bg-green-600 px-6 py-4 font-semibold text-white shadow-lg shadow-green-200 transition hover:-translate-y-0.5 hover:bg-green-700">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-green-600">Specialities</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">Find the right specialist</h2>
          </div>
        </div>

        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {specialityCards.map((item) => (
            <button
              key={item.title}
              className="group h-full min-h-[180px] rounded-[24px] border border-slate-100 bg-white p-5 text-left shadow-sm transition card-lift"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-green-700 transition group-hover:bg-green-600 group-hover:text-white">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.desc}</p>
            </button>
          ))}
        </div>
      </section> */}

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-green-600">Featured doctors</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">Trusted specialists, ready today</h2>
          </div>
        </div>

        <div className="grid auto-rows-fr gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="group flex h-full flex-col overflow-hidden rounded-[30px] border border-slate-100 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition card-lift"
            >
              <div className="relative">
                <img
                  src={doc.image}
                  alt={doc.name}
                  loading="lazy"
                  className="h-72 w-full object-cover sm:h-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                <div className="absolute left-4 top-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-green-700 shadow-sm backdrop-blur">
                    Verified
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    <Star size={12} fill="currentColor" /> {doc.rating}
                  </span>
                </div>
                <button
                  type="button"
                  className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/90 text-slate-700 shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:text-green-700"
                  aria-label="Add to wishlist"
                >
                  <Star size={18} />
                </button>
                <div className="absolute bottom-4 left-4 right-4 rounded-[22px] border border-white/60 bg-white/92 px-4 py-3 shadow-lg backdrop-blur">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* <span className="text-lg font-semibold text-slate-500 line-through">
                        {doc.fee}
                      </span> */}

                      <span className="text-2xl font-bold text-green-700">
                        {doc.OfferFee}
                      </span>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${doc.availableToday ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {doc.availableToday ? "🟢 Available Today" : "🔴 Not Available"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6 md:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{doc.name}</h3>
                    <p className="mt-1 font-semibold text-green-700">{doc.speciality}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-500">{doc.qualification}</p>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-600">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <span className="mb-1 block text-xs uppercase tracking-[0.24em] text-slate-400">Experience</span>
                    {doc.experience}
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <span className="mb-1 block text-xs uppercase tracking-[0.24em] text-slate-400">Languages</span>
                    {doc.languages}
                  </div>
                  <div className="col-span-2 rounded-2xl bg-slate-50 p-3">
                    <span className="mb-1 block text-xs uppercase tracking-[0.24em] text-slate-400">Hospital / Clinic</span>
                    {doc.clinic}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={16} className="text-green-600" />
                    {doc.availableToday ? "Available Today 09:00 AM – 05:00 PM" : "Available Tomorrow 10:00 AM – 04:00 PM"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Star size={16} className="text-amber-500" fill="currentColor" /> {doc.rating}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="w-full rounded-2xl bg-green-600 py-3.5 font-semibold text-white shadow-lg shadow-green-200 transition hover:-translate-y-0.5 hover:bg-green-700"
                    onClick={() => {
                      setSelectedDoctor(doc);
                      document.getElementById("book-appointment")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    Consult Now
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-green-200 hover:bg-slate-50"
                    onClick={() => {
                      setSelectedDoctor(doc);
                      document.getElementById("book-appointment")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="mt-10 text-center text-slate-500">No doctors match your search.</div>
        )}
      </section>

      <section id="book-appointment" className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-[40px] border border-emerald-100 bg-white shadow-[0_30px_90px_rgba(16,185,129,0.12)]">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/60 via-white to-white" />
          <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-200/35 blur-3xl" />
          <div className="pointer-events-none absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-green-200/35 blur-3xl" />

          <div className="relative p-8 md:p-12">
            <div className="mb-10 text-center">
              <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/80 px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700 shadow-sm">
                <Stethoscope size={14} /> Book now
              </div>
              <h2 className="mb-3 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">Book Appointment</h2>
              <p className="text-slate-600">Schedule your consultation in minutes</p>
            </div>

            <div className="grid gap-8 md:grid-cols-[1.35fr_0.95fr] md:items-start">
              {/* FORM */}
              <div>
                <div className="mb-8 grid gap-4 md:grid-cols-2">
                  <button
                    onClick={() => setMode("visit")}
                    className={`group flex items-center justify-center gap-2 rounded-2xl border py-5 font-semibold transition ${
                      mode === "visit"
                        ? "border-green-700 bg-green-700 text-white shadow-xl shadow-green-200"
                        : "border-green-200 bg-white text-slate-700 hover:bg-green-50"
                    }`}
                  >
                    <UserRound className="transition-transform group-hover:scale-110" size={18} />
                    In-Person Visit
                  </button>

                  <button
                    onClick={() => setMode("online")}
                    className={`group flex items-center justify-center gap-2 rounded-2xl border py-5 font-semibold transition ${
                      mode === "online"
                        ? "border-green-700 bg-green-700 text-white shadow-xl shadow-green-200"
                        : "border-green-200 bg-white text-slate-700 hover:bg-green-50"
                    }`}
                  >
                    <Video className="transition-transform group-hover:scale-110" size={18} />
                    Online Consultation
                  </button>
                </div>

                <div className="mb-7 grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-3 block font-medium text-slate-700">Full Name <span className="text-rose-500">*</span></label>
                    <input
                      value={booking.name}
                      onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                      className="w-full rounded-2xl border border-green-200 bg-white px-5 py-4 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="mb-3 block font-medium text-slate-700">Email <span className="text-rose-500">*</span></label>
                    <input
                      value={booking.email}
                      onChange={(e) => setBooking({ ...booking, email: e.target.value })}
                      className="w-full rounded-2xl border border-green-200 bg-white px-5 py-4 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="mb-3 block font-medium text-slate-700">Phone <span className="text-rose-500">*</span></label>
                    <input
                      value={booking.phone}
                      onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                      className="w-full rounded-2xl border border-green-200 bg-white px-5 py-4 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                      placeholder="+91 12345 67890"
                    />
                  </div>

                  <div>
                    <label className="mb-3 block font-medium text-slate-700">Preferred Date <span className="text-rose-500">*</span></label>
                    <input
                      type="date"
                      value={booking.date}
                      onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                      className="w-full rounded-2xl border border-green-200 bg-white px-5 py-4 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <label className="mb-3 block font-medium text-slate-700">Describe Your Symptoms</label>
                  <textarea
                    rows="5"
                    placeholder="Brief description of your health concern..."
                    value={booking.symptoms}
                    onChange={(e) => setBooking({ ...booking, symptoms: e.target.value })}
                    className="w-full rounded-2xl border border-green-200 bg-white p-5 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                  />

                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Upload picture</label>
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-green-50 p-4">
                      <input
                        type="file"
                        className="w-full cursor-pointer rounded-xl bg-transparent text-sm text-gray-600 file:cursor-pointer file:mr-4 file:rounded-full file:border-0 file:bg-green-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-green-700"
                      />
                      <p className="mt-2 text-xs font-semibold text-slate-500">Optional — images help the doctor understand faster.</p>
                    </div>
                  </div>
                </div>

                {bookingMessage && (
                  <p className="mb-4 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700">{bookingMessage}</p>
                )}

                <button
                  onClick={handleBook}
                  className="w-full rounded-2xl bg-green-700 py-5 text-xl font-bold text-white shadow-xl transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-100"
                >
                  Confirm Appointment
                </button>
              </div>

              {/* SUMMARY */}
              <aside className="rounded-[28px] border border-emerald-100 bg-white/70 p-6 shadow-sm backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Booking summary</p>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">Your details at a glance</h3>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <Clock3 size={18} />
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Doctor</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{selectedDoctor?.name || "-"}</p>
                    <p className="mt-1 text-xs font-semibold text-emerald-700">{selectedDoctor?.speciality || "-"}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Mode</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{mode === "visit" ? "In-Person" : "Online"}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Fee</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{selectedDoctor?.OfferFee || "₹0"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Preferred Date</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{booking.date || "—"}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Ready check</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {(!booking.name || !booking.email || !booking.phone || !booking.date)
                        ? "Complete required fields to confirm"
                        : "All set — confirm appointment"}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold text-slate-500">You can edit your details anytime before confirming.</p>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
        <div className="grid auto-rows-fr gap-6 md:grid-cols-2 xl:grid-cols-3">
          {whyCards.map((item) => (
            <div key={item} className="card-lift flex h-full items-center gap-4 rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-green-700">
                <Stethoscope size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{item}</h3>
                <p className="mt-1 text-sm text-slate-500">Designed to make every consultation feel secure and professional.</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-16">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-green-600">How it works</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">A simple consultation journey</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {processSteps.map((item, index) => (
            <div key={item.step} className="flex h-full flex-col rounded-[24px] border border-slate-100 bg-white p-6 text-center shadow-sm transition card-lift">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-lg font-bold text-white shadow-lg shadow-green-200">
                {item.step}
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.desc}</p>
              {index < processSteps.length - 1 && <div className="mt-6 hidden text-2xl font-bold text-green-600 md:block">↓</div>}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-green-600">Patient reviews</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">What patients say</h2>
          </div>
        </div>

        <div className="grid auto-rows-fr gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.name} className="flex h-full flex-col rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm transition card-lift">
              <div className="flex items-center gap-4">
                <img src={review.image} alt={review.name} loading="lazy" className="h-14 w-14 rounded-full border-2 border-emerald-100 object-cover" />
                <div>
                  <h3 className="font-bold text-slate-900">{review.name}</h3>
                  <p className="text-sm text-slate-500">{review.doctor}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} size={16} fill={idx < review.rating ? "currentColor" : "none"} />
                ))}
              </div>
              <p className="mt-4 flex-1 leading-7 text-slate-600">{review.text}</p>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{review.date}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-20">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-green-600">FAQ</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">Questions patients ask most</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((item, index) => (
            <div key={item.q} className="overflow-hidden rounded-[22px] border border-slate-100 bg-white shadow-sm">
              <button
                onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}
                className="flex w-full items-center justify-between gap-4 px-7 py-5 text-left transition hover:bg-slate-50"
              >
                <span className="font-semibold text-slate-900">{item.q}</span>
                <span className={`text-green-600 transition-transform ${activeFaq === index ? "rotate-180" : ""}`}>↓</span>
              </button>
              <div className={`grid transition-all duration-300 ${activeFaq === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden px-6 pb-10 leading-7 text-slate-600">{item.a}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 md:pb-24">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-green-700 via-emerald-700 to-green-800 p-8 text-white shadow-[0_24px_70px_rgba(16,185,129,0.25)] md:p-12">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">Need medical advice?</p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">Book an appointment today.</h2>
              <p className="mt-3 max-w-2xl leading-7 text-white/80">Get connected to trusted specialists with a premium consultation experience designed to feel fast, reassuring, and easy to use.</p>
            </div>
            <a href="#book-appointment" className="rounded-2xl bg-white px-8 py-4 font-bold text-green-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
              Book Appointment
            </a>
          </div>
        </div>
      </section>


    </div>
  );
}

export default Consult;