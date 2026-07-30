import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { getReviews, approveReview, rejectReview, hideReview } from "../services/admin.service";

const statusVariant = (status) => {
  const s = String(status).toLowerCase();
  if (s === "approved") return "success";
  if (s === "pending") return "warning";
  if (s === "rejected" || s === "hidden") return "danger";
  return "neutral";
};

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadReviews = () => {
    setLoading(true);
    setError(null);
    const params = { limit: 20, page };
    if (search.trim()) params.q = search.trim();
    if (statusFilter !== "All") params.status = statusFilter;
    getReviews(params)
      .then((res) => {
        const list = res.reviews || [];
        setReviews(Array.isArray(list) ? list : []);
        setTotalPages(res.pagination?.totalPages || 1);
      })
      .catch((err) => {
        console.error("Reviews load error:", err);
        setError("Failed to load reviews. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadReviews();
  }, [page, search, statusFilter]);

  const handleApprove = async (reviewId) => {
    try {
      await approveReview(reviewId);
      showNotification("Review approved successfully");
      loadReviews();
    } catch (err) {
      showNotification(err.response?.data?.message || "Approve failed", "error");
    }
  };

  const handleReject = async (reviewId) => {
    try {
      await rejectReview(reviewId);
      showNotification("Review rejected successfully");
      loadReviews();
    } catch (err) {
      showNotification(err.response?.data?.message || "Reject failed", "error");
    }
  };

  const handleHide = async (reviewId) => {
    try {
      await hideReview(reviewId);
      showNotification("Review hidden successfully");
      loadReviews();
    } catch (err) {
      showNotification(err.response?.data?.message || "Hide failed", "error");
    }
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-xl text-white font-semibold text-sm transition-all ${
          notification.type === "error" ? "bg-red-500" : "bg-green-600"
        }`}>
          {notification.msg}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Customer Feedback</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Reviews</div>
          <div className="mt-1 text-sm text-neutral-500">Customer reviews from database.</div>
        </div>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-neutral-900 font-extrabold">Review Queue</div>
            <div className="text-sm text-neutral-500">{reviews.length} review entries</div>
          </div>
          <div className="flex gap-3">
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="border border-neutral-200 rounded-2xl px-4 py-2 outline-none w-full sm:w-64 text-sm"
              placeholder="Search reviews..."
            />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="border border-neutral-200 rounded-2xl px-4 py-2 outline-none text-sm"
            >
              <option>All</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
              <option>Hidden</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-neutral-500 font-semibold">Loading reviews...</div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="text-red-600 font-extrabold mb-2">Error</div>
              <div className="text-neutral-500 text-sm mb-3">{error}</div>
              <button className="btn-primary" onClick={loadReviews}>Retry</button>
            </div>
          ) : reviews.length === 0 ? (
            <EmptyState title={search ? "No reviews match your search" : "No reviews found"} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {reviews.map((r) => {
                const productName = r.product?.product_name || r.productName || "N/A";
                const doctorName = r.doctor?.fullName || r.doctorName || "";
                const userName = r.user?.user_name || r.userName || "Anonymous";
                const status = r.status || "Pending";
                const rating = r.rating || 0;

                return (
                  <div key={r._id} className="rounded-2xl border border-neutral-200 p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant={statusVariant(status)}>{status}</Badge>
                      <div className="text-xs text-neutral-500">★ {rating}/5</div>
                    </div>
                    <div className="text-xs text-neutral-500">Product</div>
                    <div className="font-extrabold text-neutral-900 mt-1">{productName}</div>
                    {doctorName && (
                      <>
                        <div className="text-xs text-neutral-500 mt-1">Doctor</div>
                        <div className="font-semibold text-neutral-700">{doctorName}</div>
                      </>
                    )}
                    <div className="text-xs text-neutral-500 mt-1">By {userName}</div>
                    {r.reviewTitle && (
                      <div className="text-sm font-bold text-neutral-700 mt-2">{r.reviewTitle}</div>
                    )}
                    {r.reviewDescription && (
                      <div className="text-xs text-neutral-500 mt-1 line-clamp-2">{r.reviewDescription}</div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-100">
                      {status !== "Approved" && (
                        <button
                          onClick={() => handleApprove(r._id)}
                          className="text-xs bg-green-100 text-green-700 hover:bg-green-200 font-semibold px-3 py-1.5 rounded-lg transition"
                        >
                          Approve
                        </button>
                      )}
                      {status !== "Rejected" && (
                        <button
                          onClick={() => handleReject(r._id)}
                          className="text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200 font-semibold px-3 py-1.5 rounded-lg transition"
                        >
                          Reject
                        </button>
                      )}
                      {status !== "Hidden" && (
                        <button
                          onClick={() => handleHide(r._id)}
                          className="text-xs bg-red-100 text-red-700 hover:bg-red-200 font-semibold px-3 py-1.5 rounded-lg transition"
                        >
                          Hide
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 rounded-xl border border-neutral-200 text-sm font-semibold hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-neutral-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 rounded-xl border border-neutral-200 text-sm font-semibold hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Reviews;
