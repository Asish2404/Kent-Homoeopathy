import React from "react";
import { dashboardData } from "../data/dashboardData";
import Card from "../components/ui/Card";
import KpiCard from "../components/Dashboard/KpiCard";
import ChartSvg from "../components/ui/ChartSvg";
import Badge from "../components/ui/Badge";
import { formatCurrency, formatDate } from "../utils/formatters";

const statusVariant = (status) => {
  if (status === "Delivered") return "success";
  if (status === "Pending") return "warning";
  return "neutral";
};

const Dashboard = () => {
  const { kpis, charts, recentOrders, topSellingProducts } = dashboardData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Admin Dashboard</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Healthcare Insights</div>
          <div className="mt-1 text-neutral-500 text-sm">Operational KPIs, revenue performance and recent activity.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Orders" value={kpis.totalOrders} sublabel="All time" />
        <KpiCard label="Revenue" value={formatCurrency(kpis.revenue)} variant="neutral" />
        <KpiCard label="Customers" value={kpis.customers} variant="brand" />
        <KpiCard label="Products" value={kpis.products} variant="brand" />
        <KpiCard label="Pending Orders" value={kpis.pendingOrders} sublabel="Awaiting fulfillment" variant="warning" />
        <KpiCard label="Delivered Orders" value={kpis.deliveredOrders} sublabel="Completed" variant="success" />
        <KpiCard label="Low Stock" value={kpis.lowStock} sublabel="Needs attention" variant="warning" />
        <KpiCard label="Out of Stock" value={kpis.outOfStock} sublabel="Restock required" variant="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-neutral-900 font-extrabold">Revenue Chart</div>
              <div className="text-sm text-neutral-500">Weekly revenue trend (mock)</div>
            </div>
            <Badge variant="brand">Live</Badge>
          </div>
          <div className="mt-4">
            <ChartSvg data={charts.revenueSeries} />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-neutral-900 font-extrabold">Orders & Sales</div>
              <div className="text-sm text-neutral-500">Operations overview (mock)</div>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <div className="text-sm font-bold text-neutral-700 mb-2">Orders</div>
              <ChartSvg data={charts.ordersSeries} stroke="#16a34a" />
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-700 mb-2">Sales</div>
              <ChartSvg data={charts.salesSeries} stroke="#10b981" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="p-5 xl:col-span-1">
          <div className="text-neutral-900 font-extrabold">Top Selling Products</div>
          <div className="text-sm text-neutral-500 mt-1">Most purchased items (mock)</div>
          <div className="mt-4 space-y-3">
            {topSellingProducts.map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 px-3 py-3"
              >
                <div className="min-w-0">
                  <div className="font-extrabold text-neutral-900 truncate">{p.name}</div>
                  <div className="text-xs text-neutral-500">{p.category} • {p.unitsSold} units</div>
                </div>
                <div className="text-sm font-extrabold text-brand-700 whitespace-nowrap">
                  {formatCurrency(p.revenue)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-neutral-900 font-extrabold">Recent Orders</div>
              <div className="text-sm text-neutral-500">Latest order activity (mock)</div>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full">
              <thead className="text-left text-xs text-neutral-500">
                <tr>
                  <th className="font-bold py-3">Order</th>
                  <th className="font-bold py-3">Customer</th>
                  <th className="font-bold py-3">Date</th>
                  <th className="font-bold py-3">Status</th>
                  <th className="font-bold py-3">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-t border-neutral-200">
                    <td className="py-3 font-extrabold text-neutral-900">{o.id}</td>
                    <td className="py-3 text-neutral-700">{o.customerName}</td>
                    <td className="py-3 text-neutral-500">{formatDate(o.date)}</td>
                    <td className="py-3">
                      <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                    </td>
                    <td className="py-3 font-extrabold text-brand-700">{formatCurrency(o.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

