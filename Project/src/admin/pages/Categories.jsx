

import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

import { productsData } from "../data/productsData";

const Categories = () => {
  const categories = Array.from(new Set((productsData.products || []).map((p) => p.category)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Catalog Management</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Categories</div>
          <div className="mt-1 text-sm text-neutral-500">Derived dynamically from productsData.</div>
        </div>
        <button className="btn-primary" type="button">
          Add Category
        </button>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-neutral-900 font-extrabold">All Categories</div>
            <div className="text-sm text-neutral-500">Total {categories.length}</div>
          </div>
          <Badge variant="brand">Auto</Badge>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat}
              className="rounded-2xl border border-neutral-200 px-4 py-4 flex items-center justify-between gap-3"
            >
              <div>
                <div className="text-sm text-neutral-500">Category</div>
                <div className="text-neutral-900 font-extrabold">{cat}</div>
              </div>
              <Badge variant="neutral">Active</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Categories;

