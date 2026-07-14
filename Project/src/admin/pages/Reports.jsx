

import { analyticsData } from "../data/analyticsData";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

const Reports = () => {
  const { reports } = analyticsData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Management Reports</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Reports</div>
          <div className="mt-1 text-sm text-neutral-500">Operational reporting (mock).</div>
        </div>
        <button className="btn-primary" type="button">
          Generate
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="p-5 xl:col-span-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-neutral-900 font-extrabold">Daily</div>
              <div className="text-sm text-neutral-500 mt-1">Last two days</div>
            </div>
            <Badge variant="brand">Mock</Badge>
          </div>
          <div className="mt-4 space-y-3">
            {reports.daily.map((r) => (
              <div
                key={r.date}
                className="rounded-2xl border border-neutral-200 px-3 py-3 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs text-neutral-500">Date</div>
                  <div className="font-extrabold text-neutral-900">{r.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-neutral-500">Revenue</div>
                  <div className="font-extrabold text-brand-700">{r.revenue}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-neutral-900 font-extrabold">Weekly and Monthly</div>
              <div className="text-sm text-neutral-500 mt-1">Revenue / Orders / Customers</div>
            </div>
            <Badge variant="brand">Updated</Badge>
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
                      <th className="font-bold py-2">Customers</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {reports.weekly.map((r) => (
                      <tr key={r.range} className="border-t border-neutral-200">
                        <td className="py-2 font-extrabold text-neutral-900">{r.range}</td>
                        <td className="py-2 text-neutral-700">{r.revenue}</td>
                        <td className="py-2 text-neutral-700">{r.orders}</td>
                        <td className="py-2 text-neutral-700">{r.customers}</td>
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
                      <th className="font-bold py-2">Customers</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {reports.monthly.map((r) => (
                      <tr key={r.range} className="border-t border-neutral-200">
                        <td className="py-2 font-extrabold text-neutral-900">{r.range}</td>
                        <td className="py-2 text-neutral-700">{r.revenue}</td>
                        <td className="py-2 text-neutral-700">{r.orders}</td>
                        <td className="py-2 text-neutral-700">{r.customers}</td>
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

export default Reports;

