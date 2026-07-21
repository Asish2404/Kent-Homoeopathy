import React, { useState, useEffect, useCallback } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { formatCurrency } from "../utils/formatters";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

import {
  getDashboardCharts,
  getDashboardOrders,
  getDashboardCustomers,
} from "../services/admin.service";

const ChartBlock = ({ title, subtitle, children }) => (
  <Card className="p-5">
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-neutral-900 font-extrabold">{title}</div>
        <div className="text-sm text-neutral-500">{subtitle}</div>
      </div>
      <Badge variant="brand">Live</Badge>
    </div>
    <div className="mt-4">{children}</div>
  </Card>
);

const transformChartData = (data) =>
  (data || []).map((d) => ({
    label: d.key,
    value: d.value,
  }));

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [paymentsData, setPaymentsData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [reports, setReports] = useState({ daily: [], weekly: [], monthly: [] });

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [chartsRes, ordersRes] = await Promise.all([
        getDashboardCharts(),
        getDashboardOrders(),
      ]);

      const charts = chartsRes?.charts || {};

      setRevenueData(transformChartData(charts.revenue));
      setOrdersData(transformChartData(charts.orders));
      setPaymentsData(transformChartData(charts.payments));
      setUsersData(transformChartData(charts.users));

      // Build report data from orders aggregation
      const dailyOrders = ordersRes?.dailyOrders || [];
      const monthlyOrders = ordersRes?.monthlyOrders || [];

      setReports({
        daily: dailyOrders.slice(-5).map((d) => ({
          date: d.date,
          revenue: d.count,
          orders: d.count,
        })),
        weekly: [],
        monthly: monthlyOrders.slice(-6).map((m) => ({
          range: m.month,
          revenue: m.count,
          orders: m.count,
        })),
      });
    } catch (err) {
      console.error("Analytics load error:", err);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <div className="section-eyebrow">Analytics & KPIs</div>
            <div className="mt-2 text-3xl font-extrabold text-neutral-900">Analytics</div>
            <div className="mt-1 text-sm text-neutral-500">Loading chart data...</div>
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-5">
              <div className="animate-pulse">
                <div className="h-4 bg-neutral-200 rounded w-32 mb-2"></div>
                <div className="h-48 bg-neutral-100 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <div className="section-eyebrow">Analytics & KPIs</div>
            <div className="mt-2 text-3xl font-extrabold text-neutral-900">Analytics</div>
          </div>
        </div>
        <Card className="p-8 text-center">
          <div className="text-red-600 font-extrabold text-lg mb-2">Error Loading Analytics</div>
          <div className="text-neutral-500 text-sm mb-4">{error}</div>
          <button className="btn-primary" onClick={loadAnalytics}>Retry</button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Analytics & KPIs</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Analytics</div>
          <div className="mt-1 text-sm text-neutral-500">Charts powered by Recharts (live data).</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartBlock title="Revenue" subtitle="Revenue trend">
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No revenue data yet" />
          )}
        </ChartBlock>

        <ChartBlock title="Orders" subtitle="Order volume">
          {ordersData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ordersData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#16a34a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No orders data yet" />
          )}
        </ChartBlock>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartBlock title="Payments" subtitle="Payment transactions">
          {paymentsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={paymentsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No payments data yet" />
          )}
        </ChartBlock>

        <ChartBlock title="Customers" subtitle="User growth">
          {usersData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={usersData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No customers data yet" />
          )}
        </ChartBlock>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="p-5 xl:col-span-1">
          <div className="text-neutral-900 font-extrabold">Reports</div>
          <div className="text-sm text-neutral-500 mt-1">Daily activity</div>
          <div className="mt-4 space-y-4">
            <div>
              <div className="text-sm font-bold text-neutral-700 mb-2">Daily</div>
              <div className="space-y-2">
                {reports.daily.length > 0 ? (
                  reports.daily.map((r) => (
                    <div key={r.date} className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 px-3 py-2">
                      <div className="text-xs text-neutral-700 font-extrabold">{r.date}</div>
                      <div className="text-xs text-neutral-500">Orders {r.orders}</div>
                    </div>
                  ))
                ) : (
                  <EmptyState title="No daily data" />
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-neutral-900 font-extrabold">Monthly</div>
              <div className="text-sm text-neutral-500">Monthly order volume</div>
            </div>
            <Badge variant="brand">Summary</Badge>
          </div>

          <div className="mt-4">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="text-left text-xs text-neutral-500">
                  <tr>
                    <th className="font-bold py-2">Month</th>
                    <th className="font-bold py-2">Orders</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {reports.monthly.length > 0 ? (
                    reports.monthly.map((r) => (
                      <tr key={r.range} className="border-t border-neutral-200">
                        <td className="py-2 font-extrabold text-neutral-900">{r.range}</td>
                        <td className="py-2 text-neutral-700">{r.revenue}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="py-4">
                        <EmptyState title="No monthly data" />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;

