

import { customersData } from "../data/customersData";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

const Customers = () => {
  const { customers } = customersData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Customer Management</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Customers</div>
          <div className="mt-1 text-sm text-neutral-500">View customer profiles from centralized data.</div>
        </div>
        <button className="btn-primary" type="button">
          Add Customer
        </button>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-neutral-900 font-extrabold">Customer Directory</div>
            <div className="text-sm text-neutral-500">Total {customers.length} customers</div>
          </div>
          <Badge variant="brand">Updated</Badge>
        </div>

        <div className="mt-4 overflow-x-auto">
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
                <tr key={c.id} className="border-t border-neutral-200">
                  <td className="py-3">
                    <div className="font-extrabold text-neutral-900">{c.name}</div>
                    <div className="text-xs text-neutral-500">{c.id}</div>
                  </td>
                  <td className="py-3 text-neutral-700">{c.email}</td>
                  <td className="py-3 text-neutral-700">{c.address.city}</td>
                  <td className="py-3 text-neutral-700">{c.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Customers;

