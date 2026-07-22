import { useState, useEffect, useCallback } from "react";
import Card from "../components/ui/Card";
import KpiCard from "../components/Dashboard/KpiCard";
import ChartSvg from "../components/ui/ChartSvg";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { formatCurrency, formatDate } from "../utils/formatters";
import LoadingSkeleton, { StatsCardSkeleton, DashboardChartSkeleton, TableRowSkeleton } from "../../components/LoadingSkeleton";
import {
  getDashboardOverview,
  getDashboardCharts,
  getDashboardProducts,
  getOrders,
} from "../services/admin.service";

const statusVariant = (status) => {
  if (status === "Delivered" || status === "delivered") return "success";
  if (status === "Pending" || status === "pending") return "warning";
  return "neutral";
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewRes, chartsRes, productsRes, ordersRes] = await Promise.all([
        getDashboardOverview(),
        getDashboardCharts(),
        getDashboardProducts(),
        getOrders({ limit: 5, sortBy: "createdAt", sortOrder: "desc" }),
      ]);

      const overview = overviewRes;
      setKpis({
        totalOrders: overview.totalOrders || 0,
        revenue: overview.todaysRevenue || 0,
        customers: overview.totalUsers || 0,
        products: overview.totalProducts || 0,
        pendingOrders: overview.pendingOrders || 0,
        deliveredOrders: overview.completedOrders || 0,
        lowStock: overview.inventoryAlerts?.lowStock || 0,
        outOfStock: overview.inventoryAlerts?.outOfStock || 0,
      });

      // Transform chart data to match ChartSvg format { label, value }
      const chartData = chartsRes?.charts || {};
      setCharts({
        revenueSeries: (chartData.revenue || []).map((d) => ({
          label: d.key,
          value: d.value,
        })),
        ordersSeries: (chartData.orders || []).map((d) => ({
          label: d.key,
          value: d.value,
        })),
        salesSeries: (chartData.payments || []).map((d) => ({
          label: d.key,
          value: d.value,
        })),
      });

      setTopSellingProducts(
        (productsRes?.topSellingProducts || []).slice(0, 4).map((p) => ({
          name: p.productName || "Unknown",
          category: "",
          unitsSold: p.totalQty || 0,
          revenue: p.totalRevenue || 0,
        }))
      );

      const orders = ordersRes?.orders || [];
      setRecentOrders(
        orders.map((o) => ({
          id: o.orderNumber || o._id,
          customerName: o.shippingAddress?.fullName || o.customer?.user_name || "N/A",
          date: o.createdAt,
          status: o.status || o.orderStatus || "pending",
          amount: o.grandTotal || o.orderPrice || 0,
        }))
      );
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <div className="section-eyebrow">Admin Dashboard</div>
            <div className="mt-2 text-3xl font-extrabold text-neutral-900">Healthcare Insights</div>
            <div className="mt-1 text-neutral-500 text-sm">Loading dashboard data...</div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <LoadingSkeleton type="stats-card" count={8} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <div className="section-eyebrow">Admin Dashboard</div>
            <div className="mt-2 text-3xl font-extrabold text-neutral-900">Healthcare Insights</div>
            <div className="mt-1 text-neutral-500 text-sm">Dashboard</div>
          </div>
        </div>
        <Card className="p-8 text-center">
          <div className="text-red-600 font-extrabold text-lg mb-2">Error Loading Dashboard</div>
          <div className="text-neutral-500 text-sm mb-4">{error}</div>
          <button className="btn-primary" onClick={loadDashboard}>
            Retry
          </button>
        </Card>
      </div>
    );
  }

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
        <KpiCard label="Today's Revenue" value={formatCurrency(kpis.revenue)} variant="neutral" />
        <KpiCard label="Customers" value={kpis.customers} variant="brand" />
        <KpiCard label="Products" value={kpis.products} variant="brand" />
        <KpiCard label="Pending Orders" value={kpis.pendingOrders} sublabel="Awaiting fulfillment" variant="warning" />
        <KpiCard label="Completed Orders" value={kpis.deliveredOrders} sublabel="Delivered" variant="success" />
        <KpiCard label="Low Stock" value={kpis.lowStock} sublabel="Needs attention" variant="warning" />
        <KpiCard label="Out of Stock" value={kpis.outOfStock} sublabel="Restock required" variant="danger" />
      </div>

      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-neutral-900 font-extrabold">Revenue Trend</div>
                <div className="text-sm text-neutral-500">Revenue over time</div>
              </div>
              <Badge variant="brand">Live</Badge>
            </div>
            <div className="mt-4">
              {charts.revenueSeries.length > 0 ? (
                <ChartSvg data={charts.revenueSeries} />
              ) : (
                <EmptyState title="No revenue data" />
              )}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-neutral-900 font-extrabold">Orders & Payments</div>
                <div className="text-sm text-neutral-500">Operations overview</div>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <div className="text-sm font-bold text-neutral-700 mb-2">Orders</div>
                {charts.ordersSeries.length > 0 ? (
                  <ChartSvg data={charts.ordersSeries} stroke="#16a34a" />
                ) : (
                  <EmptyState title="No orders data" />
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-neutral-700 mb-2">Payments</div>
                {charts.salesSeries.length > 0 ? (
                  <ChartSvg data={charts.salesSeries} stroke="#10b981" />
                ) : (
                  <EmptyState title="No payments data" />
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="p-5 xl:col-span-1">
          <div className="text-neutral-900 font-extrabold">Top Selling Products</div>
          <div className="text-sm text-neutral-500 mt-1">Most purchased items</div>
          <div className="mt-4 space-y-3">
            {topSellingProducts.length > 0 ? (
              topSellingProducts.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 px-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="font-extrabold text-neutral-900 truncate">{p.name}</div>
                    <div className="text-xs text-neutral-500">{p.unitsSold} units</div>
                  </div>
                  <div className="text-sm font-extrabold text-brand-700 whitespace-nowrap">
                    {formatCurrency(p.revenue)}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No products data" />
            )}
          </div>
        </Card>

        <Card className="p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-neutral-900 font-extrabold">Recent Orders</div>
              <div className="text-sm text-neutral-500">Latest order activity</div>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            {recentOrders.length > 0 ? (
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
            ) : (
              <EmptyState title="No recent orders" />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

