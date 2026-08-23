import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Star, Clock3, Edit3, Trash2, Plus, MessageSquare } from "lucide-react";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import { getDoctors, createDoctor, updateDoctor, deleteDoctor, getReviews, createReview, deleteReview } from "../services/admin.service";

const emptyDoctorForm = {
  doctor_name: "",
  specialization: "",
  qualification: "",
  experience: "",
  hospital: "",
  available_days: "",
  available_time: "",
  image: "",
  about: "",
};

const DoctorModal = ({ doctor, onClose, onSave, saving }) => {
  const [form, setForm] = useState({ ...emptyDoctorForm, ...(doctor || {}) });
  const [doctorReviews, setDoctorReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newReview, setNewReview] = useState({ userName: "", rating: 5, reviewTitle: "", reviewDescription: "" });
  const [reviewMsg, setReviewMsg] = useState(null);

  const fetchDoctorReviews = useCallback(async () => {
    if (!doctor?._id) return;
    try {
      setReviewsLoading(true);
      const res = await getReviews({ doctorId: doctor._id, limit: 50 });
      setDoctorReviews(Array.isArray(res.reviews) ? res.reviews : []);
    } catch {
      setDoctorReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [doctor?._id]);

  useEffect(() => {
    if (doctor?._id) {
      fetchDoctorReviews();
    }
  }, [doctor?._id, fetchDoctorReviews]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAddDoctorReview = async (e) => {
    e.preventDefault();
    if (!doctor?._id) return;
    try {
      await createReview({
        doctorId: doctor._id,
        userName: newReview.userName || "Verified Patient",
        rating: Number(newReview.rating),
        title: newReview.reviewTitle,
        comment: newReview.reviewDescription,
      });
      setNewReview({ userName: "", rating: 5, reviewTitle: "", reviewDescription: "" });
      setReviewMsg({ type: "success", text: "Doctor review added successfully!" });
      await fetchDoctorReviews();
    } catch (err) {
      setReviewMsg({ type: "error", text: err.response?.data?.message || "Failed to add review." });
    }
  };

  const handleDeleteDoctorReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await deleteReview(reviewId);
      await fetchDoctorReviews();
    } catch (err) {
      window.alert("Failed to delete review.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 p-5 sticky top-0 bg-white z-10">
          <div className="text-lg font-extrabold text-neutral-900">
            {doctor ? "Edit Doctor Profile" : "Add New Doctor"}
          </div>
          <button type="button" onClick={onClose} className="text-2xl leading-none text-neutral-400 hover:text-neutral-700">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-neutral-700">Doctor Name *</label>
              <input value={form.doctor_name} onChange={handleChange("doctor_name")} required className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none" placeholder="e.g. Dr. A. K. Sharma" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-neutral-700">Specialization *</label>
              <input value={form.specialization} onChange={handleChange("specialization")} required className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none" placeholder="e.g. Senior Homeopath & Chronic Care" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-neutral-700">Qualification *</label>
              <input value={form.qualification} onChange={handleChange("qualification")} required className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none" placeholder="e.g. BHMS, MD (Homeopathy)" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-neutral-700">Experience (Years) *</label>
              <input type="number" min="0" value={form.experience} onChange={handleChange("experience")} required className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none" placeholder="10" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-neutral-700">Hospital / Clinic *</label>
              <input value={form.hospital} onChange={handleChange("hospital")} required className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none" placeholder="Kent Wellness Center, Kolkata" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-neutral-700">Available Days *</label>
              <input value={form.available_days} onChange={handleChange("available_days")} className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none" placeholder="Mon - Sat" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-neutral-700">Available Time *</label>
              <input value={form.available_time} onChange={handleChange("available_time")} className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none" placeholder="10:00 AM - 05:00 PM" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-neutral-700">Image URL *</label>
              <input value={form.image} onChange={handleChange("image")} required className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none" placeholder="https://images.unsplash.com/photo-..." />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-neutral-700">About Doctor *</label>
              <textarea rows={4} value={form.about} onChange={handleChange("about")} required className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none resize-y" placeholder="Doctor biography and clinical background..." />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline px-5 py-2.5 text-sm" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary px-6 py-2.5 text-sm" disabled={saving}>
              {saving ? "Saving..." : doctor ? "Save Changes" : "Create Doctor"}
            </button>
          </div>
        </form>

        {/* Doctor Review Management Section (Admin Only) */}
        {doctor?._id && (
          <div className="border-t border-neutral-200 p-5 bg-neutral-50/70">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-[var(--brand-700)]" />
              <h4 className="text-sm font-extrabold text-neutral-900">Doctor Reviews & Ratings</h4>
            </div>

            {reviewMsg && (
              <div className={`p-3 rounded-xl text-xs font-semibold mb-3 ${reviewMsg.type === "success" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                {reviewMsg.text}
              </div>
            )}

            {/* Add Review Form */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 mb-4">
              <div className="text-xs font-bold text-neutral-700 mb-2">Add Verified Review for Doctor</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                <input
                  value={newReview.userName}
                  onChange={(e) => setNewReview((p) => ({ ...p, userName: e.target.value }))}
                  placeholder="Patient Name"
                  className="border border-neutral-200 rounded-xl px-3 py-2 text-xs outline-none"
                />
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview((p) => ({ ...p, rating: Number(e.target.value) }))}
                  className="border border-neutral-200 rounded-xl px-3 py-2 text-xs outline-none bg-white"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Star)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Star)</option>
                  <option value={3}>⭐⭐⭐ (3 Star)</option>
                  <option value={2}>⭐⭐ (2 Star)</option>
                  <option value={1}>⭐ (1 Star)</option>
                </select>
                <input
                  value={newReview.reviewTitle}
                  onChange={(e) => setNewReview((p) => ({ ...p, reviewTitle: e.target.value }))}
                  placeholder="Review Title"
                  className="border border-neutral-200 rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>
              <textarea
                value={newReview.reviewDescription}
                onChange={(e) => setNewReview((p) => ({ ...p, reviewDescription: e.target.value }))}
                placeholder="Patient testimonial / feedback text..."
                rows={2}
                className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-xs outline-none mb-2"
              />
              <button
                type="button"
                onClick={handleAddDoctorReview}
                className="btn-primary py-2 px-4 text-xs font-bold"
              >
                + Add Doctor Review
              </button>
            </div>

            {/* List of Doctor Reviews */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-neutral-600">Existing Reviews ({doctorReviews.length})</div>
              {reviewsLoading ? (
                <div className="text-xs text-neutral-400 py-2">Loading reviews...</div>
              ) : doctorReviews.length === 0 ? (
                <div className="text-xs text-neutral-400 italic">No reviews recorded yet for this doctor.</div>
              ) : (
                doctorReviews.map((rev) => (
                  <div key={rev._id} className="bg-white p-3 rounded-xl border border-neutral-200 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900">{rev.user?.user_name || rev.userName || "Verified Patient"}</span>
                        <span className="text-amber-500 font-semibold">★ {rev.rating}</span>
                        {rev.reviewTitle && <span className="font-semibold text-neutral-700">· {rev.reviewTitle}</span>}
                      </div>
                      <p className="text-neutral-600 mt-1">{rev.reviewDescription || rev.comment}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteDoctorReview(rev._id)}
                      className="text-red-500 hover:text-red-700 font-bold shrink-0 p-1"
                      title="Delete Review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const mapDoctor = (doc) => ({
  ...doc,
  id: doc._id,
  _id: doc._id,
  name: doc.doctor_name,
  speciality: doc.specialization,
  qualification: doc.qualification,
  experience: `${doc.experience} Years`,
  clinic: doc.hospital,
  rating: Number(doc.averageRating || 4.8).toFixed(1),
  image: doc.image,
  about: doc.about,
  availableDays: doc.available_days || "Mon - Sat",
  availableTime: doc.available_time || "10:00 AM - 05:00 PM",
});

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);

  const loadDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDoctors({ limit: 1000 });
      setDoctors(Array.isArray(res.doctors) ? res.doctors : []);
    } catch (err) {
      console.error("Doctors load error:", err);
      setError("Failed to load doctors. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const normalizedDoctors = useMemo(() => doctors.map(mapDoctor), [doctors]);

  const filteredDoctors = useMemo(() => {
    const q = search.trim().toLowerCase();
    return normalizedDoctors.filter((doc) => {
      if (!q) return true;
      return [doc.name, doc.speciality, doc.qualification, doc.clinic].some((value) =>
        String(value || "").toLowerCase().includes(q)
      );
    });
  }, [normalizedDoctors, search]);

  const openCreate = () => {
    setEditDoctor(null);
    setShowModal(true);
  };

  const openEdit = (doctor) => {
    setEditDoctor(doctor);
    setShowModal(true);
  };

  const handleSaveDoctor = async (payload) => {
    try {
      setSaving(true);
      const body = {
        ...payload,
        experience: Number(payload.experience) || 0,
      };

      if (editDoctor?._id) {
        await updateDoctor(editDoctor._id, body);
      } else {
        await createDoctor(body);
      }

      setShowModal(false);
      setEditDoctor(null);
      await loadDoctors();
    } catch (err) {
      console.error("Doctor save error:", err);
      window.alert(err.response?.data?.message || "Failed to save doctor.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDoctor = async (doctor) => {
    const confirmed = window.confirm(`Delete doctor "${doctor.doctor_name || doctor.name || doctor._id}"?`);
    if (!confirmed) return;

    try {
      setSaving(true);
      await deleteDoctor(doctor._id);
      await loadDoctors();
    } catch (err) {
      console.error("Doctor delete error:", err);
      window.alert(err.response?.data?.message || "Failed to delete doctor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="section-eyebrow">Medical Specialists</div>
          <div className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-neutral-900">Doctors Management</div>
          <div className="mt-1 text-xs sm:text-sm text-neutral-500">
            Manage doctor profiles, qualifications, clinics, and patient reviews.
          </div>
        </div>
        <button className="btn-primary inline-flex items-center gap-2 text-sm" type="button" onClick={openCreate}>
          <Plus size={16} /> Add Doctor
        </button>
      </div>

      {/* Main Container */}
      <Card className="p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-96 border border-neutral-200 rounded-xl px-4 py-2.5 outline-none text-sm"
            placeholder="Search doctor, clinic, speciality..."
          />
          <div className="text-xs text-neutral-500">
            Showing {filteredDoctors.length} doctors
          </div>
        </div>

        <div>
          {loading ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand-600)] border-t-transparent" />
              <div className="font-semibold text-neutral-500 text-sm">Loading doctors...</div>
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <div className="mb-2 font-extrabold text-red-600">Error</div>
              <div className="mb-3 text-sm text-neutral-500">{error}</div>
              <button className="btn-primary py-2 px-4 text-xs" onClick={loadDoctors}>Retry</button>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <EmptyState title="No doctors found" />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredDoctors.map((doc) => (
                <div key={doc.id} className="flex flex-col rounded-3xl border border-neutral-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition">
                  <div className="relative h-56 bg-neutral-100">
                    <img
                      src={doc.image}
                      alt={doc.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop";
                      }}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute right-3 top-3 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(doc)}
                        className="rounded-full bg-white/95 p-2 text-neutral-700 shadow hover:text-[var(--brand-700)]"
                        title="Edit Doctor"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDoctor(doc)}
                        className="rounded-full bg-white/95 p-2 text-neutral-700 shadow hover:text-red-600"
                        title="Delete Doctor"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-lg font-bold leading-tight">{doc.name}</h3>
                      <p className="text-xs text-emerald-300 font-medium">{doc.speciality}</p>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4 text-xs space-y-2.5">
                    <div className="flex items-center justify-between text-neutral-600">
                      <span className="font-semibold text-neutral-800">{doc.qualification}</span>
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Star size={11} fill="currentColor" /> {doc.rating}
                      </span>
                    </div>

                    <div className="bg-neutral-50 rounded-xl p-2.5 space-y-1 text-neutral-600">
                      <div><span className="font-bold text-neutral-700">Experience:</span> {doc.experience}</div>
                      <div><span className="font-bold text-neutral-700">Clinic:</span> {doc.clinic}</div>
                      <div className="flex items-center gap-1 text-neutral-500 pt-0.5">
                        <Clock3 size={12} className="text-[var(--brand-600)]" />
                        <span>{doc.availableDays} ({doc.availableTime})</span>
                      </div>
                    </div>

                    <p className="text-neutral-500 line-clamp-2 leading-relaxed">{doc.about}</p>

                    <div className="pt-2 mt-auto">
                      <button
                        type="button"
                        onClick={() => openEdit(doc)}
                        className="w-full btn-outline py-2 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <Edit3 size={13} /> Edit Profile & Reviews
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {showModal && (
        <DoctorModal
          key={editDoctor?._id || "new"}
          doctor={editDoctor}
          onClose={() => {
            setShowModal(false);
            setEditDoctor(null);
          }}
          onSave={handleSaveDoctor}
          saving={saving}
        />
      )}
    </div>
  );
};

export default Doctors;