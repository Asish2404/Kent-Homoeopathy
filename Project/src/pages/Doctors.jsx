import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Star, Award, Clock3, Building2, User, ChevronRight, Calendar, Phone, Mail, CheckCircle2, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import api from "../services/api";

const WHATSAPP_NUMBER = "918910863893";

const StarRating = ({ rating, size = "w-3.5 h-3.5" }) => {
  const rounded = Math.round(rating || 0);
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`${size} ${i < rounded ? "fill-amber-400 text-amber-400" : "text-neutral-200"}`}
        />
      ))}
    </div>
  );
};

// Booking Dialog Box Modal with WhatsApp Integration (+91 891 086 3893)
const BookDoctorModal = ({ doctor, onClose }) => {
  const [formData, setFormData] = useState({
    patientName: "",
    phoneNumber: "",
    email: "",
    age: "",
    gender: "male",
    appointmentDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    consultationType: "In-Clinic Consultation",
    reasonForVisit: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
  };

  const sendWhatsAppNotification = (appointmentNo, details) => {
    const docName = doctor.doctor_name || doctor.name || "Doctor";
    const docSpec = doctor.specialization || "Homoeopathic Specialist";
    const clinic = doctor.hospital || "Kent Healthcare Center";

    const msg = `*🏥 Doctor Appointment Booking - Kent Web*
━━━━━━━━━━━━━━━━━━━━
*Doctor:* ${docName} (${docSpec})
*Clinic / Location:* ${clinic}

*Patient Details:*
• *Name:* ${details.patientName}
• *Phone:* ${details.phoneNumber}
• *Email:* ${details.email || "N/A"}
• *Age / Gender:* ${details.age ? `${details.age} yrs` : "N/A"} / ${details.gender}

*Appointment Details:*
• *Preferred Date:* ${details.appointmentDate}
• *Consultation Mode:* ${details.consultationType}
• *Health Concern:* ${details.reasonForVisit || "General Consultation"}
• *Booking Ref:* #${appointmentNo}
━━━━━━━━━━━━━━━━━━━━
Please confirm my appointment slot. Thank you!`;

    const wpUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(wpUrl, "_blank");
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientName.trim()) {
      setErrorMsg("Please enter the patient's full name.");
      return;
    }
    if (!formData.phoneNumber.trim() || formData.phoneNumber.replace(/\D/g, "").length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!formData.appointmentDate) {
      setErrorMsg("Please select an appointment date.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");

      const payload = {
        doctorId: doctor._id,
        doctorName: doctor.doctor_name || doctor.name,
        patientName: formData.patientName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim(),
        age: Number(formData.age) || undefined,
        gender: formData.gender,
        appointmentDate: formData.appointmentDate,
        consultationType: formData.consultationType,
        reasonForVisit: formData.reasonForVisit.trim(),
      };

      let appointmentNo = `APT-${Date.now().toString().slice(-6)}`;

      try {
        const res = await api.post("/doctor/book-appointment", payload);
        if (res.data?.appointment?.appointmentNumber) {
          appointmentNo = res.data.appointment.appointmentNumber;
        }
      } catch {
        // Backend fallback
      }

      const successData = {
        appointmentNumber: appointmentNo,
        ...payload,
      };

      setBookingSuccess(successData);

      // Open WhatsApp chat with prefilled appointment details to +91 891 086 3893
      sendWhatsAppNotification(appointmentNo, payload);
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-up my-auto border border-neutral-100">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-[var(--brand-50)] to-white">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={doctor.image || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300&auto=format&fit=crop"}
              alt=""
              className="w-12 h-12 rounded-2xl object-cover border border-neutral-200 shadow-sm shrink-0"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300&auto=format&fit=crop";
              }}
            />
            <div className="min-w-0">
              <div className="text-xs font-bold text-[var(--brand-700)] uppercase tracking-wider">Book Consultation</div>
              <h3 className="text-base font-bold text-neutral-900 truncate">
                {doctor.doctor_name || doctor.name}
              </h3>
              <p className="text-xs text-neutral-500 truncate">{doctor.specialization}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-neutral-100 text-neutral-600 flex items-center justify-center transition border border-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        {bookingSuccess ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h4 className="text-xl font-extrabold text-neutral-900">Appointment Booked!</h4>
              <p className="text-xs text-neutral-500 mt-1">
                Your appointment details have been prepared and sent to WhatsApp (<strong>+91 891 086 3893</strong>).
              </p>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 text-left text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                <span className="text-neutral-500 font-medium">Reference No:</span>
                <span className="font-mono font-bold text-[var(--brand-700)]">#{bookingSuccess.appointmentNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Doctor:</span>
                <span className="font-bold text-neutral-800">{doctor.doctor_name || doctor.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Patient:</span>
                <span className="font-bold text-neutral-800">{bookingSuccess.patientName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Appointment Date:</span>
                <span className="font-bold text-neutral-800">{bookingSuccess.appointmentDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Mode:</span>
                <span className="font-bold text-neutral-800">{bookingSuccess.consultationType}</span>
              </div>
              {doctor.hospital && (
                <div className="flex justify-between items-center pt-1 border-t border-neutral-200">
                  <span className="text-neutral-500">Clinic:</span>
                  <span className="font-semibold text-neutral-700 truncate max-w-[200px]">{doctor.hospital}</span>
                </div>
              )}
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => sendWhatsAppNotification(bookingSuccess.appointmentNumber, bookingSuccess)}
                className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 transition"
              >
                <FaWhatsapp className="text-base" />
                Resend on WhatsApp (+91 891 086 3893)
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full btn-outline py-2.5 rounded-2xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBookSubmit} className="p-5 space-y-3.5 text-xs sm:text-sm">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                {errorMsg}
              </div>
            )}

            {/* Doctor timings note */}
            <div className="bg-[var(--brand-50)]/70 border border-[var(--brand-100)] rounded-2xl p-3 flex items-center gap-2.5 text-xs text-[var(--brand-800)]">
              <Clock3 className="w-4 h-4 text-[var(--brand-600)] shrink-0" />
              <div>
                <span className="font-bold">Available Schedule: </span>
                <span>{doctor.available_days || "Mon-Sat"} ({doctor.available_time || "10:00 AM - 05:00 PM"})</span>
              </div>
            </div>

            {/* Patient Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Patient Full Name *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleChange}
                    placeholder="Full name"
                    required
                    className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-xl text-xs outline-none focus:border-[var(--brand-500)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="10-digit mobile"
                    required
                    className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-xl text-xs outline-none focus:border-[var(--brand-500)]"
                  />
                </div>
              </div>
            </div>

            {/* Email & Age/Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-neutral-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@email.com"
                    className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-xl text-xs outline-none focus:border-[var(--brand-500)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g. 32"
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-xs outline-none focus:border-[var(--brand-500)]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-xs outline-none bg-white focus:border-[var(--brand-500)]"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Preferred Date & Consultation Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Preferred Date *</label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    name="appointmentDate"
                    min={todayStr}
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    required
                    className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-xl text-xs outline-none focus:border-[var(--brand-500)] bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Consultation Mode</label>
                <select
                  name="consultationType"
                  value={formData.consultationType}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-xs outline-none bg-white focus:border-[var(--brand-500)]"
                >
                  <option value="In-Clinic Consultation">🏥 In-Clinic Visit</option>
                  <option value="Online Video Consultation">📹 Online Video Call</option>
                </select>
              </div>
            </div>

            {/* Health Concern */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Health Concern / Symptoms (Optional)</label>
              <textarea
                name="reasonForVisit"
                rows={2}
                value={formData.reasonForVisit}
                onChange={handleChange}
                placeholder="Briefly describe what symptoms or concerns you would like to consult about..."
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs outline-none focus:border-[var(--brand-500)] resize-y"
              />
            </div>

            {/* WhatsApp Integration Notice */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200">
              <FaWhatsapp className="text-base text-emerald-600 shrink-0" />
              <span>
                Booking details will be automatically connected to WhatsApp support at <strong>+91 891 086 3893</strong>.
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline py-2.5 px-4 text-xs flex-1"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary py-2.5 px-5 text-xs font-bold flex-[2] flex items-center justify-center gap-2 shadow-md"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <FaWhatsapp className="text-sm" />
                    Confirm & Book via WhatsApp
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const PublicDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedDoctorForReviews, setSelectedDoctorForReviews] = useState(null);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [doctorReviews, setDoctorReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/doctor", { params: { limit: 100 } });
      const list = Array.isArray(res.data?.doctors) ? res.data.doctors : [];
      setDoctors(list);
    } catch (err) {
      console.error("Failed to load doctors:", err);
      setError("Unable to load doctors at this time. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const specialties = useMemo(() => {
    const set = new Set();
    doctors.forEach((d) => {
      if (d.specialization && d.specialization.trim()) {
        set.add(d.specialization.trim());
      }
    });
    return ["All", ...Array.from(set)];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const q = search.trim().toLowerCase();
    return doctors.filter((doc) => {
      const name = (doc.doctor_name || doc.name || "").toLowerCase();
      const spec = (doc.specialization || "").toLowerCase();
      const qual = (doc.qualification || "").toLowerCase();
      const hosp = (doc.hospital || "").toLowerCase();

      const matchesQuery = !q || name.includes(q) || spec.includes(q) || qual.includes(q) || hosp.includes(q);
      const matchesSpec = selectedSpecialty === "All" || doc.specialization === selectedSpecialty;

      return matchesQuery && matchesSpec;
    });
  }, [doctors, search, selectedSpecialty]);

  const openReviewsModal = async (doc) => {
    setSelectedDoctorForReviews(doc);
    setReviewsLoading(true);
    try {
      const res = await api.get("/reviews", { params: { doctorId: doc._id, limit: 50 } });
      setDoctorReviews(Array.isArray(res.data?.reviews) ? res.data.reviews : []);
    } catch {
      setDoctorReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const openBookingModal = (doc) => {
    setSelectedDoctorForBooking(doc);
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-16">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
          <nav className="text-xs sm:text-sm text-neutral-500 flex items-center gap-2 flex-wrap">
            <Link to="/" className="hover:text-[var(--brand-700)]">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-900 font-semibold">Our Doctors</span>
          </nav>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-b from-white to-neutral-50 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="section-eyebrow">Expert Medical Specialists</span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 mt-2 tracking-tight">
              Meet Our Certified Homeopathic Doctors
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 mt-2.5 leading-relaxed">
              Explore profiles, verified qualifications, and book instant consultations with our trusted medical panel.
            </p>

            {/* Search */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-center max-w-xl mx-auto">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by doctor name, specialty, hospital..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm outline-none focus:border-[var(--brand-500)] shadow-sm"
                />
              </div>
            </div>

            {/* Specialty Filter Pills */}
            {specialties.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                {specialties.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => setSelectedSpecialty(spec)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                      selectedSpecialty === spec
                        ? "bg-[var(--brand-600)] text-white shadow-sm"
                        : "bg-white border border-neutral-200 text-neutral-700 hover:border-[var(--brand-300)]"
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-[var(--brand-600)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-neutral-600">Loading doctor profiles...</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto bg-white border border-neutral-100 rounded-2xl p-6 text-center shadow-sm">
            <p className="text-sm text-red-600 font-semibold mb-3">{error}</p>
            <button type="button" onClick={fetchDoctors} className="btn-primary py-2 px-5 text-xs">
              Try Again
            </button>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="max-w-md mx-auto bg-white border border-neutral-100 rounded-2xl p-8 text-center shadow-sm">
            <User className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-neutral-800">No doctors found</h3>
            <p className="text-xs text-neutral-500 mt-1">Try adjusting your search query or specialty filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredDoctors.map((doc) => {
              const name = doc.doctor_name || doc.name || "Doctor";
              const rating = Number(doc.averageRating || doc.rating || 4.8).toFixed(1);
              const reviewsCount = Number(doc.totalReviews || doc.review_count || 0);

              return (
                <div
                  key={doc._id}
                  className="bg-white border border-neutral-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group card-lift"
                >
                  {/* Doctor Image */}
                  <div className="relative h-48 sm:h-52 bg-gradient-to-br from-neutral-100 to-neutral-50 overflow-hidden">
                    <img
                      src={doc.image || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop"}
                      alt={name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop";
                      }}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Verified Badge & Rating */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 shadow-sm">
                        Verified
                      </span>
                      <span className="inline-flex items-center gap-1 bg-amber-500/90 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm backdrop-blur">
                        <Star size={10} className="fill-white" /> {rating}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <h3 className="text-base font-bold leading-tight drop-shadow-sm truncate">{name}</h3>
                      <p className="text-xs text-emerald-300 font-semibold drop-shadow-sm truncate">
                        {doc.specialization}
                      </p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col gap-2.5 text-xs text-neutral-600">
                    <div className="flex items-center gap-1.5 text-neutral-700 font-medium truncate">
                      <Award className="w-3.5 h-3.5 text-[var(--brand-600)] shrink-0" />
                      <span className="truncate">{doc.qualification || "BHMS"}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-neutral-50 rounded-xl p-2 border border-neutral-100">
                        <span className="block text-[10px] uppercase text-neutral-400 font-bold tracking-wider">Experience</span>
                        <span className="font-bold text-neutral-800">{doc.experience || 0} Years</span>
                      </div>
                      <div className="bg-neutral-50 rounded-xl p-2 border border-neutral-100">
                        <span className="block text-[10px] uppercase text-neutral-400 font-bold tracking-wider">Schedule</span>
                        <span className="font-bold text-neutral-800 truncate">{doc.available_days || "Mon-Sat"}</span>
                      </div>
                    </div>

                    {doc.hospital && (
                      <div className="flex items-center gap-1.5 text-neutral-600 truncate">
                        <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{doc.hospital}</span>
                      </div>
                    )}

                    {doc.available_time && (
                      <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] truncate">
                        <Clock3 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{doc.available_time}</span>
                      </div>
                    )}

                    {doc.about && (
                      <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
                        {doc.about}
                      </p>
                    )}

                    {/* Action Buttons: Book Now & Patient Reviews */}
                    <div className="mt-auto pt-3 border-t border-neutral-100 space-y-2">
                      <button
                        type="button"
                        onClick={() => openBookingModal(doc)}
                        className="w-full btn-primary py-2.5 rounded-xl text-xs font-bold shadow flex items-center justify-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Book Now
                      </button>

                      <div className="flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => openReviewsModal(doc)}
                          className="text-[var(--brand-700)] hover:text-[var(--brand-800)] font-semibold text-xs transition inline-flex items-center gap-1"
                        >
                          Patient Reviews ({reviewsCount})
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Book Doctor Dialog Box Modal */}
      {selectedDoctorForBooking && (
        <BookDoctorModal
          doctor={selectedDoctorForBooking}
          onClose={() => setSelectedDoctorForBooking(null)}
        />
      )}

      {/* Doctor Reviews Modal */}
      {selectedDoctorForReviews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-fade-up">
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={selectedDoctorForReviews.image}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border border-neutral-200 shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-neutral-900 truncate">
                    {selectedDoctorForReviews.doctor_name || selectedDoctorForReviews.name}
                  </h3>
                  <p className="text-xs text-neutral-500 truncate">{selectedDoctorForReviews.specialization}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoctorForReviews(null)}
                className="w-8 h-8 rounded-full bg-neutral-200/60 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center text-lg leading-none transition"
              >
                &times;
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
              {reviewsLoading ? (
                <div className="py-8 text-center text-xs text-neutral-500">Loading reviews...</div>
              ) : doctorReviews.length === 0 ? (
                <div className="py-8 text-center">
                  <Star className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-neutral-700">No patient reviews yet</p>
                  <p className="text-xs text-neutral-400 mt-1">Verified patient feedback will appear here.</p>
                </div>
              ) : (
                doctorReviews.map((r) => (
                  <div key={r._id} className="p-3 rounded-xl border border-neutral-100 bg-neutral-50/50">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-xs text-neutral-900">
                        {r.user?.user_name || r.userName || "Verified Patient"}
                      </span>
                      <StarRating rating={r.rating} size="w-3 h-3" />
                    </div>
                    {r.reviewTitle && (
                      <p className="text-xs font-semibold text-neutral-800 mb-0.5">{r.reviewTitle}</p>
                    )}
                    {r.reviewDescription && (
                      <p className="text-xs text-neutral-600 leading-relaxed">{r.reviewDescription}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicDoctors;
