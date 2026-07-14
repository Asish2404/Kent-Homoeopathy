

import { ordersData } from "../data/ordersData";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import OrderTable from "../shared/OrderTable";

const Orders = () => {
  const { orders } = ordersData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Order Operations</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Orders</div>
          <div className="mt-1 text-sm text-neutral-500">Track, filter and review order status.</div>
        </div>

        <button className="btn-primary" type="button">
          Export
        </button>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-neutral-900 font-extrabold">Order List</div>
            <div className="text-sm text-neutral-500">Showing {orders.length} orders</div>
          </div>
          <Badge variant="brand">Live</Badge>
        </div>

        <div className="mt-4">
          <OrderTable orders={orders} />
        </div>
      </Card>
    </div>
  );
};

export default Orders;

