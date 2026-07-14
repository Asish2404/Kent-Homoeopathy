export const formatCurrency = (value) => {
  const num = Number(value ?? 0);
  return num.toLocaleString(undefined, { style: "currency", currency: "USD" });
};

export const formatDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString();
};

