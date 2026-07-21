import { useState, useEffect, useCallback } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { getCoupons } from "../services/admin.service";

const statusVariant = (status) => {
  const s = String(status).toLowerCase();
  if (s === "active") return "success";
  if (s === "inactive" || s === "disabled") return "neutral";
  if (s === "expired") return "danger";
  return "neutral";
};

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCoupons();
      const list = res.coupons || res.data?.coupons || [];
      setCoupons(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Coupons load error:", err);
      setError("Failed to load coupons. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Promotions</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Coupons</div>
          <div className="mt-1 text-sm text-neutral-500">Promotion list from database.</div>
        </div>
        <button className="btn-primary" type="button">Create Coupon</button>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-neutral-900 font-extrabold">Available Coupons</div>
            <div className="text-sm text-neutral-500">{coupons.length} items</div>
          </div>
          <Badge variant="brand">Live</Badge>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-neutral-500 font-semibold">Loading coupons...</div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="text-red-600 font-extrabold mb-2">Error</div>
              <div className="text-neutral-500 text-sm mb-3">{error}</div>
              <button className="btn-primary" onClick={loadCoupons}>Retry</button>
            </div>
          ) : coupons.length === 0 ? (
            <EmptyState title="No coupons found" />
          ) : (
            <div className="space-y-3">
              {coupons.map((c) => (
                <div
                  key={c._id}
                  className="rounded-2xl border border-neutral-200 px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs text-neutral-500">Coupon Code</div>
                    <div className="font-extrabold text-neutral-900">{c.couponCode || c.code || "N/A"}</div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {c.discountType || "Flat"}: {c.discountValue || 0}{c.discountType === "Percentage" ? "%" : ""}
                      {c.minimumOrderValue ? ` • Min: ₹${c.minimumOrderValue}` : ""}
                    </div>
                  </div>
                  <Badge variant={statusVariant(c.status)}>{c.status || "Active"}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Coupons;

