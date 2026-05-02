import React, { useState } from "react";
import {
  FaUserMd,
  FaCalendarCheck,
  FaVideo,
  FaHeartbeat,
  FaStar,
  FaArrowRight,
  FaClock,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";

const doctors = [
  {
    id: 1,
    name: "Dr. Ananya Sen",
    speciality: "Homoeopathy Specialist",
    experience: "12 Years",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Dr. Raj Mehta",
    speciality: "Chronic Care Expert",
    experience: "10 Years",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Dr. Priya Roy",
    speciality: "Women Wellness",
    experience: "8 Years",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1200&auto=format&fit=crop",
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

  return (
    <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 min-h-screen">
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-20" id="consultancy">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* LEFT CONTENT */}
          <div>
            <span className="bg-green-100 text-green-700 px-5 py-2 rounded-full font-semibold">
              Online Consultation
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-green-900 mt-8 mb-8 leading-tight">
              Free Consultancy
              <br />
              With Expert Doctors
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-8 mb-10 max-w-xl">
              Get professional medical advice from trusted doctors. Personalized
              care, secure consultation, and quick booking.
            </p>

            <div className="flex gap-5 flex-wrap">
              {/* CTA → Scroll to Booking Section */}
              <a href="#book-appointment">
                <button className="bg-green-600 text-white px-8 py-4 rounded-2xl font-semibold cursor-pointer hover:scale-105 transition">
                  Book Free Consultation
                </button>
              </a>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div>
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1600&auto=format&fit=crop"
              alt="doctor"
              className="rounded-[40px] shadow-2xl w-full"
            />
          </div>
        </div>
      </section>

      {/* DOCTORS */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">Our Specialists</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-[35px] overflow-hidden shadow-2xl"
            >
              <img
                src={doc.image}
                alt={doc.name}
                className="w-full h-[330px] object-cover"
              />

              <div className="p-8">
                <h3 className="text-2xl font-bold mb-2">{doc.name}</h3>

                <p className="text-green-600 font-semibold mb-4">
                  {doc.speciality}
                </p>

                <div className="flex justify-between mb-6 text-gray-600">
                  <span>{doc.experience}</span>
                  <span>⭐ {doc.rating}</span>
                </div>

                <a href="#book-appointment">
                  <button className="w-full bg-green-600 text-white py-4 rounded-2xl font-semibold cursor-pointer">
                    Consult Now
                  </button>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* APPOINTMENT FORM ADDED */}
      <section id="book-appointment" className="max-w-6xl mx-auto px-6 pb-24">
        <div className="bg-white rounded-[35px] shadow-2xl border border-green-100 p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-4">
              Book Appointment
            </h2>
            <p className="text-gray-600">
              Schedule your consultation in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-10">
            <button
              onClick={() => setMode("visit")}
              className={`
py-5 rounded-2xl font-semibold transition cursor-pointer
${
  mode === "visit"
    ? "bg-green-700 text-white shadow-xl"
    : "border border-green-200 text-gray-700"
}
`}
            >
              In-Person Visit
            </button>

            <button
              onClick={() => setMode("online")}
              className={`
py-5 rounded-2xl font-semibold transition cursor-pointer
${
  mode === "online"
    ? "bg-green-700 text-white shadow-xl"
    : "border border-green-200 text-gray-700"
}
`}
            >
              Online Consultation
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block mb-3 font-medium">Full Name *</label>
              <input
                className="w-full border border-green-200 rounded-2xl px-5 py-4 outline-none"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block mb-3 font-medium">Email *</label>
              <input
                className="w-full border border-green-200 rounded-2xl px-5 py-4 outline-none"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block mb-3 font-medium">Phone *</label>
              <input
                className="w-full border border-green-200 rounded-2xl px-5 py-4 outline-none"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="block mb-3 font-medium">Preferred Date *</label>
              <input
                type="date"
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
                className={`
py-4 rounded-xl border transition cursor-pointer
${
  selectedTime === slot
    ? "bg-green-700 text-white border-green-700"
    : "border-green-200 hover:bg-green-50"
}
`}
              >
                {slot}
              </button>
            ))}
          </div>

          <div className="mb-10">
            <label className="block mb-3 font-medium">
              Describe Your Symptoms
            </label>

            <textarea
              rows="5"
              placeholder="Brief description of your health concern..."
              className="w-full border border-green-200 rounded-2xl p-5 outline-none"
            ></textarea>
          </div>

          <button className="w-full bg-green-700 hover:bg-green-800 text-white py-5 rounded-2xl text-xl font-semibold shadow-xl transition cursor-pointer">
            Confirm Appointment
          </button>
        </div>
      </section>
    </div>
  );
}

export default Consult;
