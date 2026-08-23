import { useMemo, useState, useEffect, useCallback } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { getProducts, updateProductStock, exportProducts } from "../services/admin.service";
import { formatCurrency } from "../utils/formatters";

const statusVariant = (status) => {
  const s = String(status).toLowerCase();
  if (s === "in stock" || s === "available") return "success";
  if (s === "low stock") return "warning";
  if (s === "out of stock" || s === "unavailable") return "danger";
  return "neutral";
};

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Stock edit states mapped by unique variant row id
  const [stockInputs, setStockInputs] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const loadInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProducts({ limit: 200 });
      const rawProducts = Array.isArray(res.products) ? res.products : [];
      setProducts(rawProducts);

      // Pre-fill stock inputs
      const initialStock = {};
      rawProducts.forEach((p) => {
        if (Array.isArray(p.variants) && p.variants.length > 0) {
          p.variants.forEach((v, vIndex) => {
            const rowId = `${p._id}_${v._id || vIndex}`;
            initialStock[rowId] = v.stock ?? 0;
          });
        } else {
          initialStock[p._id] = p.stock ?? 0;
        }
      });
      setStockInputs(initialStock);
    } catch (err) {
      console.error("Inventory load error:", err);
      setError("Failed to load inventory stock. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // Flatten products into variant rows
  const variantRows = useMemo(() => {
    const rows = [];
    products.forEach((product) => {
      const categoryName = product.category?.category_name || product.category || "Products";
      const brandName = product.brand || "Kent";
      const productImage = product.product_image || product.images?.[0] || "";

      if (Array.isArray(product.variants) && product.variants.length > 0) {
        product.variants.forEach((variant, vIndex) => {
          const rowId = `${product._id}_${variant._id || vIndex}`;
          const currentStock = Number(variant.stock ?? 0);
          const isNotAvailable = Boolean(variant.not_available);
          const isOutOfStock = Boolean(variant.out_of_stock) || currentStock <= 0;

          let status = "In Stock";
          if (isNotAvailable) {
            status = "Unavailable";
          } else if (isOutOfStock) {
            status = "Out Of Stock";
          } else if (currentStock <= 5) {
            status = "Low Stock";
          }

          rows.push({
            rowId,
            productId: product._id,
            variantId: variant._id,
            variantIndex: vIndex,
            productName: product.product_name || product.name || "Unnamed Product",
            image: productImage,
            brand: brandName,
            category: categoryName,
            packSize: variant.size || "Standard",
            potency: variant.potency || "",
            stock: currentStock,
            price: Number(variant.selling_price || product.discount_price || 0),
            mrp: Number(variant.mrp_price || product.mrp_price || 0),
            status,
          });
        });
      } else {
        const rowId = product._id;
        const currentStock = Number(product.stock ?? 0);
        let status = "In Stock";
        if (currentStock <= 0) {
          status = "Out Of Stock";
        } else if (currentStock <= 5) {
          status = "Low Stock";
        }

        rows.push({
          rowId,
          productId: product._id,
          variantId: null,
          variantIndex: null,
          productName: product.product_name || product.name || "Unnamed Product",
          image: productImage,
          brand: brandName,
          category: categoryName,
          packSize: product.pack || "Standard",
          potency: product.potency || "",
          stock: currentStock,
          price: Number(product.discount_price || product.price || 0),
          mrp: Number(product.mrp_price || 0),
          status,
        });
      }
    });

    return rows;
  }, [products]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return variantRows.filter((item) => {
      const name = item.productName.toLowerCase();
      const cat = item.category.toLowerCase();
      const pack = item.packSize.toLowerCase();
      const potency = item.potency.toLowerCase();
      const matchesQuery = !q || name.includes(q) || cat.includes(q) || pack.includes(q) || potency.includes(q);
      const matchesStatus = statusFilter === "All" ? true : item.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesQuery && matchesStatus;
    });
  }, [variantRows, search, statusFilter]);

  const summary = useMemo(() => {
    return filteredRows.reduce(
      (acc, item) => {
        acc.totalStock += item.stock;
        if (item.status === "Low Stock") acc.lowStock += 1;
        if (item.status === "Out Of Stock" || item.status === "Unavailable") acc.outOfStock += 1;
        return acc;
      },
      { totalStock: 0, lowStock: 0, outOfStock: 0 }
    );
  }, [filteredRows]);

  const handleStockInputChange = (rowId, val) => {
    setStockInputs((prev) => ({ ...prev, [rowId]: val }));
  };

  const handleUpdateStock = async (item) => {
    const rawVal = stockInputs[item.rowId];
    const newStock = Number(rawVal);

    if (isNaN(newStock) || newStock < 0) {
      setFeedback({ type: "error", message: "Please enter a valid non-negative stock quantity." });
      return;
    }

    try {
      setUpdatingId(item.rowId);
      setFeedback(null);

      const payload = {
        stock: Math.floor(newStock),
      };
      if (item.variantId) payload.variantId = item.variantId;
      if (item.variantIndex !== null) payload.variantIndex = item.variantIndex;

      await updateProductStock(item.productId, payload);
      
      setFeedback({
        type: "success",
        message: `Successfully updated stock for ${item.productName} (${item.packSize}) to ${newStock}.`,
      });

      // Reload fresh data from backend
      await loadInventory();
    } catch (err) {
      console.error("Failed to update stock:", err);
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to update stock quantity on server.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Stock & Pack Size Variants</div>
          <div className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-neutral-900">Inventory Management</div>
          <div className="mt-1 text-xs sm:text-sm text-neutral-500">
            Real-time pack-size stock breakdown and inline stock quantity updates.
          </div>
        </div>
        <div className="flex gap-2">
          <select
            onChange={(e) => {
              if (e.target.value) {
                exportProducts(e.target.value);
                e.target.value = "";
              }
            }}
            className="border border-neutral-200 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>Export</option>
            <option value="csv">Export CSV</option>
            <option value="xlsx">Export Excel (.xlsx)</option>
          </select>
          <button onClick={loadInventory} className="btn-outline text-xs sm:text-sm py-2 px-3" type="button">
            Refresh
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-sm font-semibold flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-xs underline ml-4">Dismiss</button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Total Units in Stock</div>
          <div className="text-3xl font-extrabold text-neutral-900 mt-1">{summary.totalStock.toLocaleString()}</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Low Stock Variants</div>
              <div className="text-3xl font-extrabold text-amber-600 mt-1">{summary.lowStock}</div>
            </div>
            <Badge variant="warning">Needs Restock</Badge>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Out of Stock Variants</div>
              <div className="text-3xl font-extrabold text-rose-600 mt-1">{summary.outOfStock}</div>
            </div>
            <Badge variant="danger">Restock</Badge>
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Pack-Size Variants</div>
          <div className="text-3xl font-extrabold text-neutral-900 mt-1">{filteredRows.length}</div>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card className="p-5">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-neutral-200 rounded-xl px-3.5 py-2.5 outline-none w-full sm:w-80 text-sm"
              placeholder="Search product, pack size, potency..."
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-neutral-200 rounded-xl px-3.5 py-2.5 outline-none text-sm bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock (&le; 5)</option>
              <option value="Out Of Stock">Out Of Stock (0)</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>
          <div className="text-xs text-neutral-500">
            Showing {filteredRows.length} pack-size items
          </div>
        </div>

        <div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-[var(--brand-600)] border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-neutral-500 text-sm font-semibold">Loading live inventory from database...</div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="text-red-600 font-extrabold mb-1">Error</div>
              <div className="text-neutral-500 text-sm mb-3">{error}</div>
              <button className="btn-primary py-2 px-4 text-xs" onClick={loadInventory}>Retry</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="text-left text-xs text-neutral-500 border-b border-neutral-200">
                  <tr>
                    <th className="font-bold py-3 px-2">Product Details</th>
                    <th className="font-bold py-3 px-2">Pack Size</th>
                    <th className="font-bold py-3 px-2">Potency</th>
                    <th className="font-bold py-3 px-2">Selling Price</th>
                    <th className="font-bold py-3 px-2">Current Stock</th>
                    <th className="font-bold py-3 px-2">Status</th>
                    <th className="font-bold py-3 px-2 text-right">Update Stock</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-neutral-100">
                  {filteredRows.map((item) => {
                    const isUpdating = updatingId === item.rowId;
                    const inputVal = stockInputs[item.rowId] ?? item.stock;

                    return (
                      <tr key={item.rowId} className="hover:bg-neutral-50/70 transition">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 flex items-center justify-center">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=150&auto=format&fit=crop";
                                  }}
                                />
                              ) : (
                                <span className="text-xs text-neutral-400 font-bold">Kent</span>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-neutral-900 text-sm">{item.productName}</div>
                              <div className="text-xs text-neutral-500">
                                {item.brand} · <span className="text-neutral-400">{item.category}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className="font-semibold text-neutral-800 bg-neutral-100 px-2 py-1 rounded text-xs">
                            {item.packSize}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-neutral-600 text-xs">
                          {item.potency ? (
                            <span className="bg-[var(--brand-50)] text-[var(--brand-700)] px-2 py-0.5 rounded font-medium border border-[var(--brand-100)]">
                              {item.potency}
                            </span>
                          ) : (
                            <span className="text-neutral-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-neutral-800 font-bold text-xs">
                          {formatCurrency(item.price)}
                          {item.mrp > item.price && (
                            <span className="text-[10px] text-neutral-400 line-through ml-1.5 font-normal">
                              ₹{item.mrp}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`font-extrabold text-sm ${
                              item.stock <= 0 ? "text-rose-600" : item.stock <= 5 ? "text-amber-600" : "text-emerald-700"
                            }`}
                          >
                            {item.stock}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="inline-flex items-center gap-2 justify-end">
                            <input
                              type="number"
                              min="0"
                              value={inputVal}
                              onChange={(e) => handleStockInputChange(item.rowId, e.target.value)}
                              className="w-20 border border-neutral-200 rounded-lg px-2 py-1.5 text-center text-xs font-bold bg-white outline-none focus:border-[var(--brand-600)]"
                            />
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleUpdateStock(item)}
                              className="btn-primary px-3 py-1.5 text-xs font-bold shrink-0 disabled:opacity-50"
                            >
                              {isUpdating ? "Saving..." : "Update"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <EmptyState title="No inventory items found matching your filters" />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default InventoryPage;
