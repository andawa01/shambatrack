import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    farmer_id: "",
    product_id: "",
    quantity: "",
    quality: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const [deliveriesRes, farmersRes, productsRes] = await Promise.all([
        api.get("/coop-admin/deliveries"),
        api.get("/coop-admin/farmers"),
        api.get("/products"),
      ]);

      setDeliveries(deliveriesRes.data.deliveries || []);
      setFarmers(farmersRes.data.farmers || []);
      setProducts(productsRes.data.products || []);
    } catch (error) {
      console.error("Error fetching deliveries data:", error);
      toast.error("Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const selectedProduct = products.find((p) => p.id === form.product_id);

  const totalAmount =
    Number(form.quantity || 0) * Number(selectedProduct?.unit_price || 0);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const startEdit = (delivery) => {
    setEditingId(delivery.id);
    setForm({
      farmer_id: delivery.farmer_id || "",
      product_id: delivery.product_id || "",
      quantity: delivery.quantity || "",
      quality: delivery.quality || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      farmer_id: "",
      product_id: "",
      quantity: "",
      quality: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const loadingToast = toast.loading(
      editingId ? "Updating delivery record..." : "Recording delivery entry...",
    );

    try {
      if (editingId) {
        await api.put(`/coop-admin/deliveries/${editingId}`, form);
        toast.success("Delivery entry updated successfully", {
          id: loadingToast,
        });
      } else {
        await api.post("/coop-admin/deliveries", form);
        toast.success("Delivery recorded successfully", { id: loadingToast });
      }

      cancelEdit();
      fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to process transaction request",
        { id: loadingToast },
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 transition-all duration-300">
      {/* Header Block Panel Layout */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Farmer Deliveries
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Log and manage inbound collection shipments, quality checking
            parameters, and payouts.
          </p>
        </div>
      </div>

      {/* Record / Edit Delivery Interactive Form Segment */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 sm:p-6 space-y-5">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-700">
              {editingId
                ? "Modify Intake Entry Details"
                : "Record New Intake Shipment"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select corresponding registered group farmers and product lines to
              calculate valuations.
            </p>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="w-full sm:w-auto text-center text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 px-3 py-2 sm:py-1.5 rounded-lg border border-rose-100 transition"
            >
              Cancel Modification
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Farmer Source
              </label>
              <div className="relative">
                <select
                  name="farmer_id"
                  value={form.farmer_id}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-green-500 bg-white transition appearance-none"
                >
                  <option value="">Select Farmer</option>
                  {farmers.map((farmer) => (
                    <option key={farmer.id} value={farmer.id}>
                      {farmer.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Product Line
              </label>
              <div className="relative">
                <select
                  name="product_id"
                  value={form.product_id}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-green-500 bg-white transition appearance-none"
                >
                  <option value="">Select Product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.unit || "unit"})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Quantity Given
              </label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                placeholder="0.00"
                required
                min="0.01"
                step="any"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-green-500 bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Quality Grade Label
              </label>
              <input
                type="text"
                name="quality"
                value={form.quality}
                onChange={handleChange}
                placeholder="e.g. Grade A, Premium"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-green-500 bg-white transition"
              />
            </div>
          </div>

          {/* Value Valuation Summary Component Banner */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-row sm:flex-wrap gap-6 text-sm w-full sm:w-auto justify-between sm:justify-start">
              <div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide block">
                  Base Unit Price
                </span>
                <span className="text-slate-700 font-bold text-xs sm:text-sm">
                  KES{" "}
                  {Number(selectedProduct?.unit_price || 0).toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2 },
                  )}
                </span>
              </div>
              <div className="border-l border-slate-200 pl-6">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide block">
                  Estimated Valuation
                </span>
                <span className="text-green-600 font-black text-sm sm:text-base">
                  KES{" "}
                  {totalAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full sm:w-auto text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-sm transition disabled:opacity-60 flex items-center justify-center gap-2 ${
                editingId
                  ? "bg-blue-600 border border-blue-700 hover:bg-blue-700"
                  : "bg-green-600 border border-green-700 hover:bg-green-700"
              }`}
            >
              {submitting && (
                <svg
                  className="animate-spin h-3.5 w-3.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              <span>
                {editingId ? "Save Corrections" : "Commit Delivery Entry"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Delivery Registry Data Presentation Layer Grid Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-700 text-sm">
            Historical Shipment Intake Ledger
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm font-medium space-y-3">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-green-600 animate-spin mx-auto"></div>
            <p>Compiling inventory intake logs...</p>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="p-12 sm:p-16 text-center">
            <p className="text-sm font-semibold text-slate-500">
              No delivery transactions indexed yet.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Submit records using the entry dashboard form modules above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider hidden md:table-row">
                  <th className="px-6 py-4">Farmer Source</th>
                  <th className="px-6 py-4">Product Cargo</th>
                  <th className="px-6 py-4">Quantity Received</th>
                  <th className="px-6 py-4">Assigned Rate</th>
                  <th className="px-6 py-4">Total Value</th>
                  <th className="px-6 py-4 text-center">Quality Spec</th>
                  <th className="px-6 py-4 text-center">Log Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100/80 text-xs sm:text-sm text-slate-600 flex flex-col md:table-row-group">
                {deliveries.map((delivery) => (
                  <tr
                    key={delivery.id}
                    className={`hover:bg-slate-50/40 transition flex flex-col md:table-row p-4 md:p-0 gap-2 md:gap-0 border-b md:border-b-0 border-slate-100 ${
                      editingId === delivery.id
                        ? "bg-blue-50/30 hover:bg-blue-50/30"
                        : ""
                    }`}
                  >
                    {/* Farmer Source */}
                    <td className="px-0 md:px-6 md:py-4 font-bold text-slate-800 text-sm md:text-base">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Farmer Source:
                      </span>
                      {delivery.farmer_name}
                    </td>

                    {/* Product Cargo */}
                    <td className="px-0 md:px-6 md:py-4 font-medium text-slate-500">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Product Cargo:
                      </span>
                      {delivery.product_name}
                    </td>

                    {/* Quantity Received */}
                    <td className="px-0 md:px-6 md:py-4 font-semibold text-slate-700">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Quantity:
                      </span>
                      {delivery.quantity} {delivery.unit}
                    </td>

                    {/* Assigned Rate */}
                    <td className="px-0 md:px-6 md:py-4 text-slate-500">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Assigned Rate:
                      </span>
                      KES{" "}
                      {Number(delivery.unit_price).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    {/* Total Value */}
                    <td className="px-0 md:px-6 md:py-4 font-black text-slate-800">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Total Value:
                      </span>
                      KES{" "}
                      {Number(delivery.total_amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    {/* Quality Spec */}
                    <td className="px-0 md:px-6 md:py-4 text-left md:text-center">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Quality Spec:
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                          delivery.quality
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : "bg-slate-100 text-slate-400 border-transparent"
                        }`}
                      >
                        {delivery.quality || "Not Tested"}
                      </span>
                    </td>

                    {/* Log Date */}
                    <td className="px-0 md:px-6 md:py-4 text-left md:text-center text-xs font-medium text-slate-400 whitespace-nowrap">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Log Date:
                      </span>
                      {new Date(delivery.date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-0 md:px-6 md:py-4 text-left md:text-right whitespace-nowrap mt-2 md:mt-0">
                      <button
                        type="button"
                        onClick={() => startEdit(delivery)}
                        disabled={submitting}
                        className="w-full sm:w-auto text-center text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 px-3 py-2 md:py-1.5 rounded-lg transition disabled:opacity-50"
                      >
                        Modify Entry
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Deliveries;
