

import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { productsData } from "../data/productsData";

const Reviews = () => {
  const products = productsData.products || [];

  const reviews = products.map((p) => ({
    productId: p.id,
    productName: p.name,
    category: p.category,
    status: p.status,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Customer Feedback</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Reviews</div>
          <div className="mt-1 text-sm text-neutral-500">Derived dynamically from productsData.</div>
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

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {reviews.map((r) => (
            <div key={r.productId} className="rounded-2xl border border-neutral-200 p-4">
              <div className="text-xs text-neutral-500">Product</div>
              <div className="font-extrabold text-neutral-900 mt-1">{r.productName}</div>
              <div className="text-sm text-neutral-500 mt-1">{r.category}</div>
              <div className="mt-3">
                <Badge
                  variant={
                    r.status === "In Stock" ? "success" : r.status === "Low Stock" ? "warning" : "danger"
                  }
                >
                  {r.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Reviews;

