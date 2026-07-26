import { useState, useEffect, useCallback } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { getDashboardOrders, getDashboardAppointments, getDashboardReports, exportReports } from "../services/admin.service";

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyOrders, setDailyOrders] = useState([]);
  const [monthlyOrders, setMonthlyOrders] = useState([]);
  const [appointments, setAppointments] = useState(null);
  const [reportsCount, setReportsCount] = useState({ prescriptionCount: 0, medicalReportCount: 0 });

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [ordersRes, apptRes, reportsRes] = await Promise.all([
        getDashboardOrders({ range: "month" }),
        getDashboardAppointments(),
        getDashboardReports(),
      ]);

      setDailyOrders((ordersRes?.dailyOrders || []).slice(-5).map((d) => ({
        date: d.date,
        revenue: d.count,
        orders: d.count,
      })));

      setMonthlyOrders((ordersRes?.monthlyOrders || []).slice(-6).map((m) => ({
        range: m.month,
        revenue: m.count,
        orders: m.count,
      })));

      setAppointments({
        upcoming: apptRes?.upcoming || 0,
        completed: apptRes?.completed || 0,
        cancelled: apptRes?.cancelled || 0,
      });

      setReportsCount({
        prescriptionCount: reportsRes?.prescriptionCount || 0,
        medicalReportCount: reportsRes?.medicalReportCount || 0,
      });
    } catch (err) {
      console.error("Reports load error:", err);
      setError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="section-eyebrow">Management Reports</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Reports</div>
          <div className="mt-1 text-sm text-neutral-500">Loading reports data...</div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="p-5">
              <div className="animate-pulse">
                <div className="h-4 bg-neutral-200 rounded w-32 mb-2"></div>
                <div className="h-32 bg-neutral-100 rounded"></div>
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
        <div>
          <div className="section-eyebrow">Management Reports</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Reports</div>
        </div>
        <Card className="p-8 text-center">
          <div className="text-red-600 font-extrabold text-lg mb-2">Error Loading Reports</div>
          <div className="text-neutral-500 text-sm mb-4">{error}</div>
          <button className="btn-primary" onClick={loadReports}>Retry</button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Management Reports</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Reports</div>
          <div className="mt-1 text-sm text-neutral-500">Operational reporting from database.</div>
        </div>
        <select
          onChange={(e) => { if (e.target.value) { exportReports(e.target.value); e.target.value = ""; } }}
          className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none text-sm bg-white cursor-pointer"
          defaultValue=""
        >
          <option value="" disabled>Export</option>
          <option value="csv">CSV</option>
          <option value="xlsx">Excel (.xlsx)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="p-5 xl:col-span-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-neutral-900 font-extrabold">Prescriptions & Reports</div>
              <div className="text-sm text-neutral-500 mt-1">From database</div>
            </div>
            <Badge variant="brand">Live</Badge>
          </div>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-neutral-200 px-3 py-3">
              <div className="text-xs text-neutral-500">Total Prescriptions</div>
              <div className="font-extrabold text-neutral-900 text-lg">{reportsCount.prescriptionCount}</div>
            </div>
            <div className="rounded-2xl border border-neutral-200 px-3 py-3">
              <div className="text-xs text-neutral-500">Medical Reports</div>
              <div className="font-extrabold text-neutral-900 text-lg">{reportsCount.medicalReportCount}</div>
            </div>
            {appointments && (
              <>
                <div className="rounded-2xl border border-neutral-200 px-3 py-3">
                  <div className="text-xs text-neutral-500">Upcoming Appointments</div>
                  <div className="font-extrabold text-neutral-900 text-lg">{appointments.upcoming}</div>
                </div>
                <div className="rounded-2xl border border-neutral-200 px-3 py-3">
                  <div className="text-xs text-neutral-500">Completed Appointments</div>
                  <div className="font-extrabold text-neutral-900 text-lg">{appointments.completed}</div>
                </div>
              </>
            )}
          </div>
        </Card>

        <Card className="p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-neutral-900 font-extrabold">Order Reports</div>
              <div className="text-sm text-neutral-500 mt-1">Daily & Monthly</div>
            </div>
            <Badge variant="brand">Updated</Badge>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-bold text-neutral-700 mb-2">Daily Orders</div>
              <div className="overflow-x-auto">
                {dailyOrders.length > 0 ? (
                  <table className="min-w-full">
                    <thead className="text-left text-xs text-neutral-500">
                      <tr>
                        <th className="font-bold py-2">Date</th>
                        <th className="font-bold py-2">Orders</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {dailyOrders.map((r) => (
                        <tr key={r.date} className="border-t border-neutral-200">
                          <td className="py-2 font-extrabold text-neutral-900">{r.date}</td>
                          <td className="py-2 text-neutral-700">{r.orders}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <EmptyState title="No daily data" />
                )}
              </div>
            </div>

            <div>
              <div className="text-sm font-bold text-neutral-700 mb-2">Monthly Orders</div>
              <div className="overflow-x-auto">
                {monthlyOrders.length > 0 ? (
                  <table className="min-w-full">
                    <thead className="text-left text-xs text-neutral-500">
                      <tr>
                        <th className="font-bold py-2">Month</th>
                        <th className="font-bold py-2">Orders</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {monthlyOrders.map((r) => (
                        <tr key={r.range} className="border-t border-neutral-200">
                          <td className="py-2 font-extrabold text-neutral-900">{r.range}</td>
                          <td className="py-2 text-neutral-700">{r.orders}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <EmptyState title="No monthly data" />
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;

