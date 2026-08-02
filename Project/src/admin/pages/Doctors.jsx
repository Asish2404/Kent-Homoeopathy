import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Clock3, Edit3, Trash2, Plus } from "lucide-react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from "../services/admin.service";

const emptyDoctorForm = {
  doctor_name: "",
  specialization: "",
  qualification: "",
  experience: "",
  hospital: "",
  consultation_fee: "",
  available_days: "",
  available_time: "",
  image: "",
  about: "",
};

const DoctorModal = ({ doctor, onClose, onSave, saving }) => {
  const [form, setForm] = useState({ ...emptyDoctorForm, ...(doctor || {}) });

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-100 p-5">
          <div className="text-lg font-extrabold text-neutral-900">
            {doctor ? "Edit Doctor" : "Add Doctor"}
          </div>
          <button type="button" onClick={onClose} className="text-2xl leading-none text-neutral-400 hover:text-neutral-700">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-neutral-700">Doctor Name *</label>
              <input value={form.doctor_name} onChange={handleChange("doctor_name")} className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none" placeholder="Dr. Name" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-neutral-700">Specialization *</label>
              <input value={form.specialization} onChange={handleChange("specialization")} className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none" placeholder="Specialization" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-neutral-700">Qualification *</label>
              <input value={form.qualification} onChange={handleChange("qualification")} className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none" placeholder="BHMS, MD..." />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-neutral-700">Experience (Years) *</label>
              <input type="number" min="0" value={form.experience} onChange={handleChange("experience")} className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none" placeholder="10" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-neutral-700">Consultation Fee *</label>
              <input type="number" min="0" value={form.consultation_fee} onChange={handleChange("consultation_fee")} className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none" placeholder="499" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-neutral-700">Hospital / Clinic *</label>
              <input value={form.hospital} onChange={handleChange("hospital")} className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none" placeholder="Clinic name" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-neutral-700">Available Days *</label>
              <input value={form.available_days} onChange={handleChange("available_days")} className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none" placeholder="Mon-Sat" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-neutral-700">Available Time *</label>
              <input value={form.available_time} onChange={handleChange("available_time")} className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none" placeholder="9:00 AM - 5:00 PM" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-neutral-700">Image URL *</label>
              <input value={form.image} onChange={handleChange("image")} className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none" placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-neutral-700">About Doctor *</label>
              <textarea rows={4} value={form.about} onChange={handleChange("about")} className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none" placeholder="Short doctor bio" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline px-5 py-3" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary px-5 py-3" disabled={saving}>
              {saving ? "Saving..." : doctor ? "Update Doctor" : "Add Doctor"}
            </button>
          </div>
        </form>
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
  languages: "English, Hindi",
  clinic: doc.hospital,
  fee: `₹${doc.consultation_fee}`,
  OfferFee: `₹${doc.consultation_fee}`,
  availableToday: true,
  rating: Number(doc.averageRating || 4.8).toFixed(1),
  image: doc.image,
  about: doc.about,
});

const Doctors = () => {
  const navigate = useNavigate();
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const summary = useMemo(() => ({
    total: doctors.length,
    averageFee: doctors.length ? Math.round(doctors.reduce((sum, doc) => sum + Number(doc.consultation_fee || 0), 0) / doctors.length) : 0,
  }), [doctors]);

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
        experience: Number(payload.experience),
        consultation_fee: Number(payload.consultation_fee),
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
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="section-eyebrow">Consult Doctor</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Doctors</div>
          <div className="mt-1 text-sm text-neutral-500">Manage the doctors shown in the consultation flow.</div>
        </div>
        <button className="btn-primary inline-flex items-center gap-2" type="button" onClick={openCreate}>
          <Plus size={16} /> Add Doctor
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="p-5">
          <div className="text-neutral-500 text-sm font-semibold">Total Doctors</div>
          <div className="text-3xl font-extrabold text-neutral-900 mt-1">{summary.total}</div>
        </Card>
        <Card className="p-5">
          <div className="text-neutral-500 text-sm font-semibold">Average Fee</div>
          <div className="text-3xl font-extrabold text-neutral-900 mt-1">₹{summary.averageFee}</div>
        </Card>
        <Card className="p-5 flex items-center justify-between gap-3">
          <div>
            <div className="text-neutral-500 text-sm font-semibold">Consult Flow</div>
            <div className="text-lg font-extrabold text-neutral-900 mt-1">Live doctors</div>
          </div>
          <Badge variant="brand">Active</Badge>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-96 border border-neutral-200 rounded-2xl px-4 py-3 outline-none"
            placeholder="Search doctor, clinic, speciality..."
          />
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
              <div className="font-semibold text-neutral-500">Loading doctors...</div>
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <div className="mb-2 font-extrabold text-red-600">Error</div>
              <div className="mb-3 text-sm text-neutral-500">{error}</div>
              <button className="btn-primary" onClick={loadDoctors}>Retry</button>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <EmptyState title="No doctors found" />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredDoctors.map((doc) => (
                <div key={doc.id} className="group flex h-full flex-col overflow-hidden rounded-[30px] border border-slate-100 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition card-lift relative">
                  <div className="absolute right-4 top-4 z-10 flex gap-2">
                    <button type="button" onClick={() => openEdit(doc)} className="rounded-full bg-white/95 p-2 text-slate-600 shadow-md hover:text-green-700" aria-label="Edit doctor">
                      <Edit3 size={16} />
                    </button>
                    <button type="button" onClick={() => handleDeleteDoctor(doc)} className="rounded-full bg-white/95 p-2 text-slate-600 shadow-md hover:text-red-600" aria-label="Delete doctor">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="relative">
                    <img src={doc.image} alt={doc.name} loading="lazy" className="h-72 w-full object-cover sm:h-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                    <div className="absolute left-4 top-4 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-green-700 shadow-sm backdrop-blur">
                        Verified
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                        <Star size={12} fill="currentColor" /> {doc.rating}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 rounded-[22px] border border-white/60 bg-white/92 px-4 py-3 shadow-lg backdrop-blur">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-green-700">{doc.OfferFee}</span>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
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
                        <span className="mb-1 block text-xs uppercase tracking-[0.24em] text-slate-400">Fee</span>
                        {doc.fee}
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
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3">
                      <button
                        type="button"
                        className="w-full rounded-2xl bg-green-600 py-3.5 font-semibold text-white shadow-lg shadow-green-200 transition hover:-translate-y-0.5 hover:bg-green-700"
                        onClick={() => navigate("/Consult")}
                      >
                        Book Appointment
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