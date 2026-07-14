

import { inventoryData } from "../data/inventoryData";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

const Inventory = () => {
  const { summary, items } = inventoryData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Stock & Availability</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Inventory</div>
          <div className="mt-1 text-sm text-neutral-500">Live-like stock breakdown (mock dataset).</div>
        </div>
        <button className="btn-primary" type="button">
          Reorder
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="text-neutral-500 text-sm font-semibold">Current Stock</div>
          <div className="text-3xl font-extrabold text-neutral-900 mt-1">{summary.currentStock}</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-neutral-500 text-sm font-semibold">Low Stock</div>
              <div className="text-3xl font-extrabold text-neutral-900 mt-1">{summary.lowStock}</div>
            </div>
            <Badge variant="warning">Needs</Badge>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-neutral-500 text-sm font-semibold">Out of Stock</div>
              <div className="text-3xl font-extrabold text-neutral-900 mt-1">{summary.outOfStock}</div>
            </div>
            <Badge variant="danger">Restock</Badge>
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-neutral-500 text-sm font-semibold">Total Items</div>
          <div className="text-3xl font-extrabold text-neutral-900 mt-1">{items.length}</div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-neutral-900 font-extrabold">Stock Items</div>
            <div className="text-sm text-neutral-500">Availability status by product</div>
          </div>
          <Badge variant="brand">Inventory</Badge>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full">
            <thead className="text-left text-xs text-neutral-500">
              <tr>
                <th className="font-bold py-3">Product</th>
                <th className="font-bold py-3">On Hand</th>
                <th className="font-bold py-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {items.map((it) => (
                <tr key={it.name} className="border-t border-neutral-200">
                  <td className="py-3">
                    <div className="font-extrabold text-neutral-900">{it.name}</div>
                  </td>
                  <td className="py-3 font-extrabold text-neutral-900">{it.onHand}</td>
                  <td className="py-3">
                    <Badge
                      variant={
                        it.status === "In Stock"
                          ? "success"
                          : it.status === "Low Stock"
                          ? "warning"
                          : "danger"
                      }
                    >
                      {it.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Inventory;

