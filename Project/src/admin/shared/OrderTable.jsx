

const OrderTable = ({ orders = [] }) => {
  return (
    <div className="mt-2 overflow-x-auto">
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
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-neutral-200">
              <td className="py-3 font-extrabold text-neutral-900">{o.id}</td>
              <td className="py-3 text-neutral-700">{o.customerName}</td>
              <td className="py-3 text-neutral-500">{o.date}</td>
              <td className="py-3">
                <span className="inline-flex items-center rounded-full border border-neutral-200 px-3 py-1 text-xs font-bold text-neutral-700 bg-white">
                  {o.status}
                </span>
              </td>
              <td className="py-3 font-extrabold text-brand-700">{o.amount}</td>
            </tr>
          ))}
          {orders.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-10">
                <div className="text-center text-neutral-500 font-extrabold">
                  No orders found
                </div>
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;

