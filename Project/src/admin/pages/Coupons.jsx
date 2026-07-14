

import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

import { ordersData } from "../data/ordersData";

const Coupons = () => {
  const derived = (ordersData.orders || [])
    .filter((o) => (o.id || "").toLowerCase().includes("10"))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Promotions</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Coupons</div>
          <div className="mt-1 text-sm text-neutral-500">Promotion list derived from centralized order mock.</div>
        </div>
        <button className="btn-primary" type="button">
          Create Coupon
        </button>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-neutral-900 font-extrabold">Available Coupons</div>
            <div className="text-sm text-neutral-500">{derived.length} items</div>
          </div>
          <Badge variant="brand">Mock</Badge>
        </div>

        <div className="mt-4 space-y-3">
          {derived.map((o) => (
            <div
              key={o.id}
              className="rounded-2xl border border-neutral-200 px-4 py-3 flex items-center justify-between gap-3"
            >
              <div>
                <div className="text-xs text-neutral-500">Coupon Code</div>
                <div className="font-extrabold text-neutral-900">{String(o.id).replace("ORD-", "SAVE-")}</div>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Coupons;

