import { useState, useEffect, useCallback } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { getReviews } from "../services/admin.service";

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

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getReviews({ limit: 50 });
      const list = res.reviews || [];
      setReviews(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Reviews load error:", err);
      setError("Failed to load reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Customer Feedback</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Reviews</div>
          <div className="mt-1 text-sm text-neutral-500">Customer reviews from database.</div>
        </div>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-neutral-900 font-extrabold">Review Queue</div>
            <div className="text-sm text-neutral-500">{reviews.length} review entries</div>
          </div>
          <Badge variant="brand">Live</Badge>
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
            <EmptyState title="No reviews found" />
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Reviews;

