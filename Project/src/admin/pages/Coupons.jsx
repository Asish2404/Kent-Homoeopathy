import { useState, useEffect, useCallback } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, exportCoupons } from "../services/admin.service";

const statusVariant = (status) => {
  const s = String(status).toLowerCase();
  if (s === "active") return "success";
  if (s === "inactive" || s === "disabled") return "neutral";
  if (s === "expired") return "danger";
  return "neutral";
};

const emptyCouponForm = {
  couponCode: "",
  title: "",
  description: "",
  discountType: "Flat",
  discountValue: "",
  maximumDiscount: "",
  minimumOrderValue: "",
  usageLimit: "",
  usagePerUser: "1",
  startDate: "",
  expiryDate: "",
  status: "Active",
};

const CouponModal = ({ coupon, onClose, onSave, saving }) => {
  const [form, setForm] = useState({ ...emptyCouponForm });
  const [errors, setErrors] = useState({});
  const isEdit = !!coupon;

  useEffect(() => {
    if (coupon) {
      setForm({
        couponCode: coupon.couponCode || "",
        title: coupon.title || coupon.couponName || "",
        description: coupon.description || "",
        discountType: coupon.discountType || "Flat",
        discountValue: coupon.discountValue ?? "",
        maximumDiscount: coupon.maximumDiscount ?? coupon.maximumDiscountAmount ?? "",
        minimumOrderValue: coupon.minimumOrderValue ?? "",
        usageLimit: coupon.usageLimit ?? coupon.totalUsageLimit ?? "",
        usagePerUser: coupon.usagePerUser ?? "1",
        startDate: coupon.startDate ? coupon.startDate.slice(0, 10) : "",
        expiryDate: coupon.expiryDate ? coupon.expiryDate.slice(0, 10) : "",
        status: coupon.status || "Active",
      });
    } else {
      setForm({ ...emptyCouponForm });
    }
    setErrors({});
  }, [coupon]);

  const validate = () => {
    const e = {};
    if (!form.couponCode.trim()) e.couponCode = "Coupon code is required";
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.discountValue || Number(form.discountValue) <= 0) e.discountValue = "Discount value must be positive";
    if (!form.startDate) e.startDate = "Start date is required";
    if (!form.expiryDate) e.expiryDate = "Expiry date is required";
    if (form.startDate && form.expiryDate && new Date(form.expiryDate) <= new Date(form.startDate)) {
      e.expiryDate = "Expiry date must be after start date";
    }
    if (form.maximumDiscount && Number(form.maximumDiscount) < 0) e.maximumDiscount = "Must be non-negative";
    if (form.minimumOrderValue && Number(form.minimumOrderValue) < 0) e.minimumOrderValue = "Must be non-negative";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      couponCode: form.couponCode.trim().toUpperCase(),
      title: form.title.trim(),
      couponName: form.title.trim(),
      description: form.description.trim(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      maximumDiscount: form.maximumDiscount ? Number(form.maximumDiscount) : 0,
      maximumDiscountAmount: form.maximumDiscount ? Number(form.maximumDiscount) : 0,
      minimumOrderValue: form.minimumOrderValue ? Number(form.minimumOrderValue) : 0,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : 0,
      totalUsageLimit: form.usageLimit ? Number(form.usageLimit) : 0,
      usagePerUser: Math.max(1, Number(form.usagePerUser) || 1),
      startDate: form.startDate,
      expiryDate: form.expiryDate,
      status: form.status,
    };
    await onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-neutral-200">
          <div className="text-lg font-extrabold text-neutral-900">{isEdit ? "Edit Coupon" : "Create Coupon"}</div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Coupon Code *</label>
              <input
                value={form.couponCode}
                onChange={handleChange("couponCode")}
                className={`border ${errors.couponCode ? "border-red-400" : "border-neutral-200"} rounded-2xl px-4 py-3 outline-none w-full text-sm`}
                placeholder="SUMMER20"
              />
              {errors.couponCode && <div className="text-xs text-red-600 mt-1">{errors.couponCode}</div>}
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Title *</label>
              <input
                value={form.title}
                onChange={handleChange("title")}
                className={`border ${errors.title ? "border-red-400" : "border-neutral-200"} rounded-2xl px-4 py-3 outline-none w-full text-sm`}
                placeholder="Summer Sale"
              />
              {errors.title && <div className="text-xs text-red-600 mt-1">{errors.title}</div>}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={handleChange("description")}
              rows={2}
              className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm"
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Discount Type</label>
              <select value={form.discountType} onChange={handleChange("discountType")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm">
                <option value="Flat">Flat</option>
                <option value="Percentage">Percentage</option>
                <option value="Free Shipping">Free Shipping</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Discount Value *</label>
              <input
                type="number"
                min="0"
                value={form.discountValue}
                onChange={handleChange("discountValue")}
                className={`border ${errors.discountValue ? "border-red-400" : "border-neutral-200"} rounded-2xl px-4 py-3 outline-none w-full text-sm`}
                placeholder={form.discountType === "Percentage" ? "10" : "100"}
              />
              {errors.discountValue && <div className="text-xs text-red-600 mt-1">{errors.discountValue}</div>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Max Discount</label>
              <input type="number" min="0" value={form.maximumDiscount} onChange={handleChange("maximumDiscount")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="0 = unlimited" />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Min Order Value</label>
              <input type="number" min="0" value={form.minimumOrderValue} onChange={handleChange("minimumOrderValue")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="0 = no minimum" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Start Date *</label>
              <input type="date" value={form.startDate} onChange={handleChange("startDate")} className={`border ${errors.startDate ? "border-red-400" : "border-neutral-200"} rounded-2xl px-4 py-3 outline-none w-full text-sm`} />
              {errors.startDate && <div className="text-xs text-red-600 mt-1">{errors.startDate}</div>}
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Expiry Date *</label>
              <input type="date" value={form.expiryDate} onChange={handleChange("expiryDate")} className={`border ${errors.expiryDate ? "border-red-400" : "border-neutral-200"} rounded-2xl px-4 py-3 outline-none w-full text-sm`} />
              {errors.expiryDate && <div className="text-xs text-red-600 mt-1">{errors.expiryDate}</div>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Usage Limit</label>
              <input type="number" min="0" value={form.usageLimit} onChange={handleChange("usageLimit")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="0 = unlimited" />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Usage Per User</label>
              <input type="number" min="1" value={form.usagePerUser} onChange={handleChange("usagePerUser")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1">Status</label>
            <select value={form.status} onChange={handleChange("status")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline px-5 py-3" disabled={saving}>Cancel</button>
            <button type="submit" className="btn-primary px-5 py-3" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Update Coupon" : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ coupon, onClose, onConfirm, deleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm mx-4 p-6">
      <div className="text-lg font-extrabold text-neutral-900 mb-2">Delete Coupon</div>
      <div className="text-sm text-neutral-600 mb-4">
        Are you sure you want to delete coupon <strong>{coupon?.couponCode}</strong>? This action cannot be undone.
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-outline px-4 py-3" disabled={deleting}>Cancel</button>
        <button onClick={() => onConfirm(coupon._id)} className="btn-outline px-4 py-3 !text-red-600 !border-red-300 hover:!bg-red-50" disabled={deleting}>
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [deleteCouponItem, setDeleteCouponItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notification, setNotification] = useState(null);

  const notify = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

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

  const handleCreate = () => {
    setEditCoupon(null);
    setShowModal(true);
  };

  const handleEdit = (coupon) => {
    setEditCoupon(coupon);
    setShowModal(true);
  };

  const handleSave = async (payload) => {
    try {
      setSaving(true);
      if (editCoupon) {
        await updateCoupon(editCoupon._id, payload);
        notify("Coupon updated successfully");
      } else {
        await createCoupon(payload);
        notify("Coupon created successfully");
      }
      setShowModal(false);
      setEditCoupon(null);
      await loadCoupons();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Operation failed";
      notify(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (couponId) => {
    try {
      setDeleting(true);
      await deleteCoupon(couponId);
      notify("Coupon deleted successfully");
      setDeleteCouponItem(null);
      await loadCoupons();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Delete failed";
      notify(msg, "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      const newStatus = coupon.status === "Active" ? "Inactive" : "Active";
      await updateCoupon(coupon._id, { status: newStatus });
      notify(`Coupon ${newStatus === "Active" ? "enabled" : "disabled"} successfully`);
      await loadCoupons();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Toggle failed";
      notify(msg, "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-2xl shadow-lg text-sm font-bold text-white ${notification.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {notification.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Promotions</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Coupons</div>
          <div className="mt-1 text-sm text-neutral-500">Promotion list from database.</div>
        </div>
        <div className="flex gap-2">
          <select
            onChange={(e) => { if (e.target.value) { exportCoupons(e.target.value); e.target.value = ""; } }}
            className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none text-sm bg-white cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>Export</option>
            <option value="csv">CSV</option>
            <option value="xlsx">Excel (.xlsx)</option>
          </select>
          <button className="btn-primary" type="button" onClick={handleCreate}>Create Coupon</button>
        </div>
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
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-neutral-500">Coupon Code</div>
                    <div className="font-extrabold text-neutral-900">{c.couponCode || c.code || "N/A"}</div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {c.discountType || "Flat"}: {c.discountValue || 0}{c.discountType === "Percentage" ? "%" : ""}
                      {c.minimumOrderValue ? ` • Min: ₹${c.minimumOrderValue}` : ""}
                    </div>
                    {c.title && <div className="text-xs text-neutral-400 mt-0.5">{c.title}</div>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleStatus(c)}
                      className={`px-3 py-1.5 rounded-2xl text-xs font-bold border ${
                        c.status === "Active"
                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          : "bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100"
                      }`}
                      title={c.status === "Active" ? "Disable coupon" : "Enable coupon"}
                    >
                      {c.status === "Active" ? "Active" : "Inactive"}
                    </button>
                    <Badge variant={statusVariant(c.status)}>{c.status || "Active"}</Badge>
                    <button onClick={() => handleEdit(c)} className="btn-outline px-3 py-2 text-xs">Edit</button>
                    <button onClick={() => setDeleteCouponItem(c)} className="btn-outline px-3 py-2 text-xs !text-red-600 !border-red-200 hover:!bg-red-50">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {showModal && (
        <CouponModal
          coupon={editCoupon}
          onClose={() => { setShowModal(false); setEditCoupon(null); }}
          onSave={handleSave}
          saving={saving}
        />
      )}

      {deleteCouponItem && (
        <DeleteConfirmModal
          coupon={deleteCouponItem}
          onClose={() => setDeleteCouponItem(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
};

export default Coupons;

