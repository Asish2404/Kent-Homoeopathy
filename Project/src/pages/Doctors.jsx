import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Star, Award, Clock3, Building2, User, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

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

const PublicDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
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
    setSelectedDoctor(doc);
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
              Explore profiles, qualifications, and patient experiences from our verified panel of experienced practitioners.
            </p>

            {/* Search & Filters */}
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

            {/* Specialty Pills */}
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

      {/* Main Grid */}
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
                  className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group card-lift"
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
                  <div className="p-3.5 sm:p-4 flex-1 flex flex-col gap-2.5 text-xs text-neutral-600">
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
                      <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed mt-1">
                        {doc.about}
                      </p>
                    )}

                    {/* View Reviews Button */}
                    <div className="mt-auto pt-2 border-t border-neutral-100 flex items-center justify-between">
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
              );
            })}
          </div>
        )}
      </div>

      {/* Doctor Reviews Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-fade-up">
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={selectedDoctor.image}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border border-neutral-200 shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-neutral-900 truncate">
                    {selectedDoctor.doctor_name || selectedDoctor.name}
                  </h3>
                  <p className="text-xs text-neutral-500 truncate">{selectedDoctor.specialization}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoctor(null)}
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
