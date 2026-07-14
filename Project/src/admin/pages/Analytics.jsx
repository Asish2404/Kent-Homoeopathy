

import { analyticsData } from "../data/analyticsData";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

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

const Analytics = () => {
  const { revenue, orders, sales, customers, reports } = analyticsData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Analytics & KPIs</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Analytics</div>
          <div className="mt-1 text-sm text-neutral-500">Charts powered by Recharts (mock dataset).</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartBlock title="Revenue" subtitle="Daily revenue trend">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={revenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartBlock>

        <ChartBlock title="Orders" subtitle="Daily order volume">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={orders} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#16a34a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBlock>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartBlock title="Sales" subtitle="Daily sales count">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={sales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartBlock>

        <ChartBlock title="Customers" subtitle="Weekly-ish customer growth">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={customers} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBlock>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="p-5 xl:col-span-1">
          <div className="text-neutral-900 font-extrabold">Reports</div>
          <div className="text-sm text-neutral-500 mt-1">Summary tables (mock)</div>
          <div className="mt-4 space-y-4">
            <div>
              <div className="text-sm font-bold text-neutral-700 mb-2">Daily</div>
              <div className="space-y-2">
                {reports.daily.map((r) => (
                  <div key={r.date} className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 px-3 py-2">
                    <div className="text-xs text-neutral-700 font-extrabold">{r.date}</div>
                    <div className="text-xs text-neutral-500">Rev {r.revenue} • Orders {r.orders}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-neutral-900 font-extrabold">Weekly & Monthly</div>
              <div className="text-sm text-neutral-500">Revenue/orders/customers</div>
            </div>
            <Badge variant="brand">Summary</Badge>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-bold text-neutral-700 mb-2">Weekly</div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="text-left text-xs text-neutral-500">
                    <tr>
                      <th className="font-bold py-2">Range</th>
                      <th className="font-bold py-2">Revenue</th>
                      <th className="font-bold py-2">Orders</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {reports.weekly.map((r) => (
                      <tr key={r.range} className="border-t border-neutral-200">
                        <td className="py-2 font-extrabold text-neutral-900">{r.range}</td>
                        <td className="py-2 text-neutral-700">{r.revenue}</td>
                        <td className="py-2 text-neutral-700">{r.orders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <div className="text-sm font-bold text-neutral-700 mb-2">Monthly</div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="text-left text-xs text-neutral-500">
                    <tr>
                      <th className="font-bold py-2">Range</th>
                      <th className="font-bold py-2">Revenue</th>
                      <th className="font-bold py-2">Orders</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {reports.monthly.map((r) => (
                      <tr key={r.range} className="border-t border-neutral-200">
                        <td className="py-2 font-extrabold text-neutral-900">{r.range}</td>
                        <td className="py-2 text-neutral-700">{r.revenue}</td>
                        <td className="py-2 text-neutral-700">{r.orders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;

