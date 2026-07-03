import React, { useState } from "react";
import {
  Search,
  UserRound,
  Video,
  Star,
  Clock3,
  Filter,
  Stethoscope,
} from "lucide-react";

const doctors = [
  {
    id: 1,
    name: "Dr. Ananya Sen",
    speciality: "Homoeopathy Specialist",
    experience: "12 Years",
    rating: "4.9",
    qualification: "BHMS, MD (Hom.)",
    languages: "English, Hindi, Bengali",
    clinic: "Dr. Kent Wellness Clinic",
    fee: "₹499",
    availableToday: true,
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Dr. Raj Mehta",
    speciality: "Chronic Care Expert",
    experience: "10 Years",
    rating: "4.8",
    qualification: "BHMS, FCCA",
    languages: "English, Hindi",
    clinic: "City Care Centre",
    fee: "₹399",
    availableToday: true,
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Dr. Priya Roy",
    speciality: "Women Wellness",
    experience: "8 Years",
    rating: "4.9",
    qualification: "BHMS, Women Health Specialist",
    languages: "English, Hindi",
    clinic: "CarePlus Women Clinic",
    fee: "₹449",
    availableToday: true,
    image:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Dr. Suman Ghosh",
    speciality: "General Physician",
    experience: "14 Years",
    rating: "4.7",
    qualification: "MBBS, Family Medicine",
    languages: "English, Hindi, Bengali",
    clinic: "Central Health Hub",
    fee: "₹349",
    availableToday: false,
    image:
      "https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Dr. Nisha Kapoor",
    speciality: "Dermatologist",
    experience: "9 Years",
    rating: "4.8",
    qualification: "MD, Skin and Aesthetic Care",
    languages: "English, Hindi",
    clinic: "SkinCare Studio",
    fee: "₹599",
    availableToday: true,
    image:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Dr. Arjun Verma",
    speciality: "Cardiologist",
    experience: "16 Years",
    rating: "4.9",
    qualification: "DM, Cardiac Care",
    languages: "English, Hindi",
    clinic: "Heartline Hospital",
    fee: "₹699",
    availableToday: true,
    image:
      "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?q=80&w=1200&auto=format&fit=crop",
  },
];

const slots = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
];

function Consult() {
  const [mode, setMode] = useState("visit");
  const [selectedTime, setSelectedTime] = useState("");
  const [query, setQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [speciality, setSpeciality] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0]);
  const [booking, setBooking] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    symptoms: "",
  });
  const [bookingMessage, setBookingMessage] = useState("");
  const [activeFaq, setActiveFaq] = useState(0);

  const specialityCards = [
    { title: "General Physician", desc: "Primary care and everyday consultation", icon: <Stethoscope size={20} /> },
    { title: "Cardiologist", desc: "Heart health and cardiovascular care", icon: <Star size={20} /> },
    { title: "Dermatologist", desc: "Skin, hair, and allergy support", icon: <Filter size={20} /> },
    { title: "Neurologist", desc: "Nervous system and headache care", icon: <UserRound size={20} /> },
    { title: "Dentist", desc: "Oral care and hygiene consultation", icon: <Clock3 size={20} /> },
    { title: "Orthopedic", desc: "Bone, joint, and mobility support", icon: <UserRound size={20} /> },
    { title: "ENT", desc: "Ear, nose, and throat consultations", icon: <Video size={20} /> },
    { title: "Gynecologist", desc: "Women’s health and wellness", icon: <Stethoscope size={20} /> },
    { title: "Pediatrician", desc: "Care for children and newborns", icon: <UserRound size={20} /> },
    { title: "Psychiatrist", desc: "Emotional health and support", icon: <Star size={20} /> },
  ];

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
    { step: "2", title: "Book Appointment", desc: "Select a slot that fits your schedule." },
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
    if (!booking.name || !booking.email || !booking.phone || !booking.date || !selectedTime) {
      setBookingMessage("Please complete the required fields and select a time slot.");
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
        time: selectedTime,
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
    <div className="bg-white min-h-screen">
      <section className="relative overflow-hidden" id="consultancy">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50" />
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-green-200/30 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur border border-emerald-100 px-5 py-2 text-green-700 font-semibold shadow-sm">
                <Stethoscope size={16} />
                Trusted online care
              </span>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 leading-[1.05] tracking-tight max-w-xl">
                Expert medical guidance with a premium consultation experience.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-8 max-w-xl">
                Find the right specialist, book in a few taps, and connect through a clean, secure consultation flow designed for modern healthcare.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-2xl bg-white shadow-lg shadow-green-100/50 border border-emerald-100 px-4 py-4">
                  <Search size={18} className="text-green-600 shrink-0" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search doctor name"
                    className="w-full outline-none bg-transparent text-slate-700 placeholder:text-slate-400"
                  />
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-white shadow-lg shadow-green-100/50 border border-emerald-100 px-4 py-4">
                  <Filter size={18} className="text-green-600 shrink-0" />
                  <input
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="Search by location"
                    className="w-full outline-none bg-transparent text-slate-700 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {specialities.slice(0, 6).map((item) => (
                  <button
                    key={item}
                    onClick={() => setSpeciality(item)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition shadow-sm ${speciality === item ? "bg-green-600 text-white shadow-green-200" : "bg-white text-slate-600 hover:text-green-700 hover:bg-green-50 border border-slate-200"}`}
                  >
                    {item === "all" ? "All Specialities" : item}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a href="#book-appointment">
                  <button className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-green-200 hover:bg-green-700 hover:-translate-y-0.5 transition">
                    Book Appointment
                  </button>
                </a>
                <button
                  onClick={() => setQuery("")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 font-semibold text-slate-700 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition"
                >
                  Search doctors
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[36px] bg-emerald-200/30 blur-2xl" />
              <div className="relative rounded-[32px] overflow-hidden shadow-[0_30px_80px_rgba(15,23,42,0.15)] border border-white bg-white">
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1600&auto=format&fit=crop"
                  alt="doctor"
                  loading="lazy"
                  className="w-full aspect-[4/3] md:aspect-[5/4] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/20 via-transparent to-transparent" />
                <div className="absolute left-4 bottom-4 right-4 rounded-2xl border border-white/40 bg-white/85 backdrop-blur p-4 shadow-xl">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold">24x7 Care</p>
                      <p className="text-lg font-bold text-slate-900">Premium consultation booking</p>
                    </div>
                    <div className="flex -space-x-2">
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

      <section className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <div className="rounded-[28px] bg-white shadow-[0_18px_50px_rgba(16,185,129,0.12)] border border-emerald-100 p-4 md:p-5">
          <div className="grid gap-4 md:grid-cols-[1.3fr_1fr_1fr_auto] items-center">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-4 bg-slate-50">
              <Search size={18} className="text-green-600 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Doctor name"
                className="w-full bg-transparent outline-none text-slate-700"
              />
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-4 bg-slate-50">
              <Stethoscope size={18} className="text-green-600 shrink-0" />
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
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-4 bg-slate-50">
              <Filter size={18} className="text-green-600 shrink-0" />
              <input
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Location"
                className="w-full bg-transparent outline-none text-slate-700"
              />
            </div>
            <button className="rounded-2xl bg-green-600 text-white px-6 py-4 font-semibold shadow-lg shadow-green-200 hover:bg-green-700 hover:-translate-y-0.5 transition inline-flex items-center justify-center gap-2">
              Search
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-green-600 font-semibold uppercase tracking-[0.28em] text-xs">Speciality</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Find the right specialist</h2>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {specialityCards.map((item) => (
            <button
              key={item.title}
              className="group text-left rounded-[24px] bg-white border border-slate-100 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition h-full min-h-[170px]"
            >
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-green-700 flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-500 mt-2 leading-6">{item.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-4 md:py-10">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-green-600 font-semibold uppercase tracking-[0.28em] text-xs">Featured doctors</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Trusted specialists, ready today</h2>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="group bg-white rounded-[28px] overflow-hidden border border-slate-100 shadow-[0_12px_30px_rgba(15,23,42,0.08)] hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(16,185,129,0.12)] transition h-full flex flex-col"
            >
              <div className="relative">
                <img
                  src={doc.image}
                  alt={doc.name}
                  loading="lazy"
                  className="w-full h-72 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-semibold text-green-700 shadow-sm">
                    Verified
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-600 text-white px-3 py-1 text-xs font-semibold shadow-sm">
                    <Star size={12} fill="currentColor" /> {doc.rating}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 backdrop-blur border border-white/60 px-4 py-3 shadow-lg">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-500">Consultation fee</p>
                      <p className="text-lg font-bold text-slate-900">{doc.fee}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${doc.availableToday ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {doc.availableToday ? "Available today" : "Limited slots"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-7 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{doc.name}</h3>
                    <p className="text-green-700 font-semibold mt-1">{doc.speciality}</p>
                  </div>
                </div>

                <p className="text-sm text-slate-500 mt-4 leading-7">{doc.qualification}</p>

                <div className="grid grid-cols-2 gap-3 mt-5 text-sm text-slate-600">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <span className="block text-xs uppercase tracking-[0.24em] text-slate-400 mb-1">Experience</span>
                    {doc.experience}
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <span className="block text-xs uppercase tracking-[0.24em] text-slate-400 mb-1">Languages</span>
                    {doc.languages}
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3 col-span-2">
                    <span className="block text-xs uppercase tracking-[0.24em] text-slate-400 mb-1">Clinic</span>
                    {doc.clinic}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5"><Clock3 size={16} className="text-green-600" /> Available today</span>
                  <span className="inline-flex items-center gap-1.5"><Star size={16} className="text-amber-500" fill="currentColor" /> {doc.rating}</span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <a href="#book-appointment" className="w-full">
                    <button
                      className="w-full rounded-2xl bg-green-600 text-white py-3.5 font-semibold shadow-lg shadow-green-200 hover:bg-green-700 hover:-translate-y-0.5 transition"
                      onClick={() => setSelectedDoctor(doc)}
                    >
                      Consult Now
                    </button>
                  </a>
                  <button className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 font-semibold text-slate-700 hover:bg-slate-50 hover:-translate-y-0.5 transition">
                    Book Appointment
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center text-slate-500 mt-10">No doctors match your search.</div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {whyCards.map((item) => (
            <div key={item} className="rounded-[24px] bg-white border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition h-full min-h-[140px] flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-green-700 flex items-center justify-center shrink-0">
                <Stethoscope size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{item}</h3>
                <p className="text-sm text-slate-500 mt-1">Designed to make every consultation feel secure and professional.</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-8 md:py-16">
        <div className="text-center mb-10">
          <p className="text-green-600 font-semibold uppercase tracking-[0.28em] text-xs">How it works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">A simple consultation journey</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {processSteps.map((item, index) => (
            <div key={item.step} className="rounded-[24px] bg-white border border-slate-100 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition text-center h-full">
              <div className="mx-auto h-14 w-14 rounded-full bg-green-600 text-white flex items-center justify-center text-lg font-bold shadow-lg shadow-green-200">
                {item.step}
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-500 mt-2 leading-6">{item.desc}</p>
              {index < processSteps.length - 1 && <div className="hidden md:block mt-6 text-green-600 text-2xl font-bold">↓</div>}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-green-600 font-semibold uppercase tracking-[0.28em] text-xs">Patient reviews</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">What patients say</h2>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.name} className="rounded-[24px] bg-white border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition h-full flex flex-col">
              <div className="flex items-center gap-4">
                <img src={review.image} alt={review.name} loading="lazy" className="h-14 w-14 rounded-full object-cover border-2 border-emerald-100" />
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
              <p className="text-slate-600 leading-7 mt-4 flex-1">{review.text}</p>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{review.date}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <p className="text-green-600 font-semibold uppercase tracking-[0.28em] text-xs">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Questions patients ask most</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((item, index) => (
            <div key={item.q} className="rounded-[22px] bg-white border border-slate-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition"
              >
                <span className="font-semibold text-slate-900">{item.q}</span>
                <span className={`transition-transform text-green-600 ${activeFaq === index ? "rotate-180" : ""}`}>↓</span>
              </button>
              <div className={`grid transition-all duration-300 ${activeFaq === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden px-6 pb-5 text-slate-600 leading-7">{item.a}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="rounded-[32px] bg-gradient-to-r from-green-700 via-emerald-700 to-green-800 p-8 md:p-12 text-white shadow-[0_24px_70px_rgba(16,185,129,0.25)] overflow-hidden relative">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <p className="text-white/70 font-semibold uppercase tracking-[0.28em] text-xs">Need medical advice?</p>
              <h2 className="text-3xl md:text-4xl font-bold mt-3">Book an appointment today.</h2>
              <p className="text-white/80 mt-3 max-w-2xl leading-7">Get connected to trusted specialists with a premium consultation experience designed to feel fast, reassuring, and easy to use.</p>
            </div>
            <a href="#book-appointment">
              <button className="rounded-2xl bg-white px-8 py-4 text-green-700 font-bold shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition">
                Book Appointment
              </button>
            </a>
          </div>
        </div>
      </section>

      <section id="book-appointment" className="max-w-6xl mx-auto px-6 pb-24">
        <div className="bg-white rounded-[35px] shadow-2xl border border-green-100 p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-4">Book Appointment</h2>
            <p className="text-gray-600">Schedule your consultation in minutes</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-10">
            <button
              onClick={() => setMode("visit")}
              className={`py-5 rounded-2xl font-semibold transition cursor-pointer ${mode === "visit" ? "bg-green-700 text-white shadow-xl" : "border border-green-200 text-gray-700"}`}
            >
              <UserRound className="inline mr-2" size={18} />
              In-Person Visit
            </button>

            <button
              onClick={() => setMode("online")}
              className={`py-5 rounded-2xl font-semibold transition cursor-pointer ${mode === "online" ? "bg-green-700 text-white shadow-xl" : "border border-green-200 text-gray-700"}`}
            >
              <Video className="inline mr-2" size={18} />
              Online Consultation
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block mb-3 font-medium">Full Name *</label>
              <input
                value={booking.name}
                onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                className="w-full border border-green-200 rounded-2xl px-5 py-4 outline-none"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block mb-3 font-medium">Email *</label>
              <input
                value={booking.email}
                onChange={(e) => setBooking({ ...booking, email: e.target.value })}
                className="w-full border border-green-200 rounded-2xl px-5 py-4 outline-none"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block mb-3 font-medium">Phone *</label>
              <input
                value={booking.phone}
                onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                className="w-full border border-green-200 rounded-2xl px-5 py-4 outline-none"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="block mb-3 font-medium">Preferred Date *</label>
              <input
                type="date"
                value={booking.date}
                onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                className="w-full border border-green-200 rounded-2xl px-5 py-4 outline-none"
              />
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-5">Select Time Slot</h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            {slots.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedTime(slot)}
                className={`py-4 rounded-xl border transition cursor-pointer ${selectedTime === slot ? "bg-green-700 text-white border-green-700" : "border-green-200 hover:bg-green-50"}`}
              >
                {slot}
              </button>
            ))}
          </div>

          <div className="mb-10">
            <label className="block mb-3 font-medium">Describe Your Symptoms</label>
            <textarea
              rows="5"
              placeholder="Brief description of your health concern..."
              value={booking.symptoms}
              onChange={(e) => setBooking({ ...booking, symptoms: e.target.value })}
              className="w-full border border-green-200 rounded-2xl p-5 outline-none"
            />
          </div>

          {bookingMessage && <p className="text-center text-sm text-green-700 mb-4">{bookingMessage}</p>}

          <button onClick={handleBook} className="w-full bg-green-700 hover:bg-green-800 text-white py-5 rounded-2xl text-xl font-semibold shadow-xl transition cursor-pointer">
            Confirm Appointment
          </button>
        </div>
      </section>
    </div>
  );
}

export default Consult;