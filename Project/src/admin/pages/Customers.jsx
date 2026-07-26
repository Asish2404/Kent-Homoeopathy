import { useState, useEffect, useCallback } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { getCustomers, exportCustomers } from "../services/admin.service";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { page, limit: 20 };
      if (query.trim()) params.search = query.trim();

      const res = await getCustomers(params);
      setCustomers(res.users || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalCount(res.pagination?.totalCount || 0);
    } catch (err) {
      console.error("Customers load error:", err);
      setError("Failed to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleSearch = (e) => {
    setQuery(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Customer Management</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Customers</div>
          <div className="mt-1 text-sm text-neutral-500">View customer profiles from centralized data.</div>
        </div>
        <div className="flex gap-2">
          <select
            onChange={(e) => { if (e.target.value) { exportCustomers(e.target.value); e.target.value = ""; } }}
            className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none text-sm bg-white cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>Export</option>
            <option value="csv">CSV</option>
            <option value="xlsx">Excel (.xlsx)</option>
          </select>
          <button className="btn-primary" type="button">
            Add Customer
          </button>
        </div>
      </div>

      <Card className="p-5">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <input
            value={query}
            onChange={handleSearch}
            className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full sm:w-80"
            placeholder="Search customers by name, email or phone..."
          />
          <div className="text-sm text-neutral-500">
            Total <span className="font-extrabold text-neutral-900">{totalCount}</span> customers
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-neutral-500 font-semibold">Loading customers...</div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="text-red-600 font-extrabold mb-2">Error</div>
              <div className="text-neutral-500 text-sm mb-3">{error}</div>
              <button className="btn-primary" onClick={loadCustomers}>Retry</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="text-left text-xs text-neutral-500">
                  <tr>
                    <th className="font-bold py-3">Customer</th>
                    <th className="font-bold py-3">Email</th>
                    <th className="font-bold py-3">City</th>
                    <th className="font-bold py-3">Phone</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {customers.map((c) => (
                    <tr key={c._id} className="border-t border-neutral-200">
                      <td className="py-3">
                        <div className="font-extrabold text-neutral-900">{c.user_name || "N/A"}</div>
                        <div className="text-xs text-neutral-500">{c._id?.slice(-8)}</div>
                      </td>
                      <td className="py-3 text-neutral-700">{c.email || "N/A"}</td>
                      <td className="py-3 text-neutral-700">{c.address || "N/A"}</td>
                      <td className="py-3 text-neutral-700">{c.phone || "N/A"}</td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10">
                        <EmptyState title="No customers found" />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-neutral-200">
              <div className="text-sm text-neutral-500">Page {page} of {totalPages}</div>
              <div className="flex gap-2">
                <button className="btn-outline px-3 py-2" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
                <button className="btn-outline px-3 py-2" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Customers;

