import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Star, Plus, Check, X, EyeOff, Trash2, Edit3, MessageSquare } from "lucide-react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  approveReview,
  rejectReview,
  hideReview,
  getProducts,
  getDoctors,
} from "../services/admin.service";

const statusVariant = (status) => {
  const s = String(status).toLowerCase();
  if (s === "approved") return "success";
  if (s === "pending") return "warning";
  if (s === "rejected" || s === "hidden") return "danger";
  return "neutral";
};

const ReviewModal = ({ review, products, doctors, onClose, onSave, saving }) => {
  const [form, setForm] = useState(() => ({
    targetType: review?.doctor ? "doctor" : "product",
    productId: review?.product?._id || review?.productId || "",
    doctorId: review?.doctor?._id || review?.doctorId || "",
    userName: review?.userName || review?.user?.user_name || "",
    rating: review?.rating || 5,
    title: review?.reviewTitle || review?.title || "",
    comment: review?.reviewDescription || review?.comment || "",
    status: review?.status || "Approved",
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      userName: form.userName || "Verified Customer",
      rating: Number(form.rating),
      title: form.title,
      comment: form.comment,
      status: form.status,
    };
    if (form.targetType === "doctor") {
      payload.doctorId = form.doctorId;
    } else {
      payload.productId = form.productId;
    }
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-neutral-200">
          <div className="text-base font-extrabold text-neutral-900">
            {review ? "Edit Review" : "Create Review (Admin)"}
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          {!review && (
            <div className="flex gap-2 p-1 bg-neutral-100 rounded-xl">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, targetType: "product" }))}
                className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition ${
                  form.targetType === "product" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
                }`}
              >
                Product Review
              </button>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, targetType: "doctor" }))}
                className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition ${
                  form.targetType === "doctor" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
                }`}
              >
                Doctor Review
              </button>
            </div>
          )}

          {form.targetType === "product" ? (
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Select Product *</label>
              <select
                value={form.productId}
                onChange={(e) => setForm((p) => ({ ...p, productId: e.target.value }))}
                required
                className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 outline-none bg-white text-xs"
              >
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>{p.product_name || p.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Select Doctor *</label>
              <select
                value={form.doctorId}
                onChange={(e) => setForm((p) => ({ ...p, doctorId: e.target.value }))}
                required
                className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 outline-none bg-white text-xs"
              >
                <option value="">Select doctor...</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>{d.doctor_name || d.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Author Name *</label>
              <input
                value={form.userName}
                onChange={(e) => setForm((p) => ({ ...p, userName: e.target.value }))}
                placeholder="e.g. Rahul Sharma"
                required
                className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Rating *</label>
              <select
                value={form.rating}
                onChange={(e) => setForm((p) => ({ ...p, rating: Number(e.target.value) }))}
                className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-xs outline-none bg-white"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                <option value={3}>⭐⭐⭐ (3 Stars)</option>
                <option value={2}>⭐⭐ (2 Stars)</option>
                <option value={1}>⭐ (1 Star)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Review Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Highly effective and authentic!"
              className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Review Comment *</label>
            <textarea
              value={form.comment}
              onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
              rows={3}
              placeholder="Detailed customer or patient feedback..."
              required
              className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-xs outline-none resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-xs outline-none bg-white capitalize"
            >
              <option value="Approved">Approved (Visible)</option>
              <option value="Pending">Pending</option>
              <option value="Hidden">Hidden</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-outline py-2 px-4 text-xs" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary py-2 px-5 text-xs font-bold" disabled={saving}>
              {saving ? "Saving..." : review ? "Update Review" : "Create Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editReviewData, setEditReviewData] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [revRes, prodRes, docRes] = await Promise.all([
        getReviews({ limit: 100 }),
        getProducts({ limit: 200 }),
        getDoctors({ limit: 100 }),
      ]);
      setReviews(Array.isArray(revRes.reviews) ? revRes.reviews : []);
      setProducts(Array.isArray(prodRes.products) ? prodRes.products : []);
      setDoctors(Array.isArray(docRes.doctors) ? docRes.doctors : []);
    } catch (err) {
      console.error("Reviews load error:", err);
      setError("Failed to load reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredReviews = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews.filter((r) => {
      const pName = (r.product?.product_name || r.productName || "").toLowerCase();
      const dName = (r.doctor?.fullName || r.doctor?.doctor_name || r.doctorName || "").toLowerCase();
      const uName = (r.user?.user_name || r.userName || "").toLowerCase();
      const title = (r.reviewTitle || r.title || "").toLowerCase();
      const comment = (r.reviewDescription || r.comment || "").toLowerCase();

      const matchesSearch = !q || pName.includes(q) || dName.includes(q) || uName.includes(q) || title.includes(q) || comment.includes(q);
      const matchesStatus = statusFilter === "All" || (r.status || "").toLowerCase() === statusFilter.toLowerCase();
      const isDoc = Boolean(r.doctor || r.doctorId);
      const matchesType = typeFilter === "All" || (typeFilter === "doctor" ? isDoc : !isDoc);

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [reviews, search, statusFilter, typeFilter]);

  const handleApprove = async (id) => {
    try {
      await approveReview(id);
      await loadData();
    } catch (err) {
      window.alert("Failed to approve review.");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectReview(id);
      await loadData();
    } catch (err) {
      window.alert("Failed to reject review.");
    }
  };

  const handleHide = async (id) => {
    try {
      await hideReview(id);
      await loadData();
    } catch (err) {
      window.alert("Failed to hide review.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this review?")) return;
    try {
      await deleteReview(id);
      await loadData();
    } catch (err) {
      window.alert("Failed to delete review.");
    }
  };

  const handleSaveModal = async (payload) => {
    try {
      setSaving(true);
      if (editReviewData?._id) {
        await updateReview(editReviewData._id, payload);
      } else {
        await createReview(payload);
      }
      setModalOpen(false);
      setEditReviewData(null);
      await loadData();
    } catch (err) {
      window.alert(err.response?.data?.message || "Failed to save review.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Moderation & Verification</div>
          <div className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-neutral-900">Reviews Management</div>
          <div className="mt-1 text-xs sm:text-sm text-neutral-500">
            Admin-moderated reviews for products and medical doctors.
          </div>
        </div>
        <button
          onClick={() => {
            setEditReviewData(null);
            setModalOpen(true);
          }}
          className="btn-primary inline-flex items-center gap-2 text-xs sm:text-sm py-2.5 px-4"
          type="button"
        >
          <Plus size={16} /> Add Review (Admin)
        </button>
      </div>

      <Card className="p-5">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4">
          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-neutral-200 rounded-xl px-3.5 py-2 outline-none text-xs sm:text-sm w-full sm:w-72"
              placeholder="Search by customer, product, doctor..."
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-xs sm:text-sm bg-white"
            >
              <option value="All">All Types</option>
              <option value="product">Product Reviews</option>
              <option value="doctor">Doctor Reviews</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-xs sm:text-sm bg-white capitalize"
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Hidden">Hidden</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="text-xs text-neutral-500">
            Showing <span className="font-bold text-neutral-900">{filteredReviews.length}</span> reviews
          </div>
        </div>

        <div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-[var(--brand-600)] border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-neutral-500 text-sm font-semibold">Loading reviews...</div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="text-red-600 font-extrabold mb-1">Error</div>
              <div className="text-neutral-500 text-sm mb-3">{error}</div>
              <button className="btn-primary py-2 px-4 text-xs" onClick={loadData}>Retry</button>
            </div>
          ) : filteredReviews.length === 0 ? (
            <EmptyState title="No reviews found matching criteria" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredReviews.map((r) => {
                const productName = r.product?.product_name || r.productName || "";
                const doctorName = r.doctor?.fullName || r.doctor?.doctor_name || r.doctorName || "";
                const userName = r.user?.user_name || r.userName || "Verified Customer";
                const status = r.status || "Approved";
                const s = String(status).toLowerCase();
                const rating = r.rating || 5;

                return (
                  <div key={r._id} className="rounded-2xl border border-neutral-200 bg-white p-4 flex flex-col justify-between hover:shadow-sm transition">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant={statusVariant(status)}>{status}</Badge>
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Star size={11} fill="currentColor" /> {rating}/5
                        </div>
                      </div>

                      {productName && (
                        <div className="mb-1.5">
                          <span className="text-[10px] uppercase font-bold text-neutral-400 block">Product</span>
                          <div className="font-bold text-neutral-900 text-xs line-clamp-1">{productName}</div>
                        </div>
                      )}

                      {doctorName && (
                        <div className="mb-1.5">
                          <span className="text-[10px] uppercase font-bold text-neutral-400 block">Doctor</span>
                          <div className="font-bold text-emerald-700 text-xs line-clamp-1">{doctorName}</div>
                        </div>
                      )}

                      <div className="text-xs text-neutral-500 mb-2">By <span className="font-semibold text-neutral-800">{userName}</span></div>

                      {r.reviewTitle && (
                        <div className="text-xs font-bold text-neutral-800 mb-1">{r.reviewTitle}</div>
                      )}
                      {(r.reviewDescription || r.comment) && (
                        <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">
                          {r.reviewDescription || r.comment}
                        </p>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-neutral-100 gap-1 text-xs">
                      <div className="flex items-center gap-1">
                        {s !== "approved" && (
                          <button
                            type="button"
                            onClick={() => handleApprove(r._id)}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg"
                            title="Approve"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        {s !== "hidden" && (
                          <button
                            type="button"
                            onClick={() => handleHide(r._id)}
                            className="p-1.5 text-neutral-600 hover:bg-neutral-100 rounded-lg"
                            title="Hide"
                          >
                            <EyeOff size={14} />
                          </button>
                        )}
                        {s !== "rejected" && (
                          <button
                            type="button"
                            onClick={() => handleReject(r._id)}
                            className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg"
                            title="Reject"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditReviewData(r);
                            setModalOpen(true);
                          }}
                          className="p-1.5 text-[var(--brand-700)] hover:bg-[var(--brand-50)] rounded-lg"
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(r._id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {modalOpen && (
        <ReviewModal
          review={editReviewData}
          products={products}
          doctors={doctors}
          onClose={() => {
            setModalOpen(false);
            setEditReviewData(null);
          }}
          onSave={handleSaveModal}
          saving={saving}
        />
      )}
    </div>
  );
};

export default Reviews;
