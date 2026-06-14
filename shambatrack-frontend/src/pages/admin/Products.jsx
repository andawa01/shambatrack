import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    unit: "",
    unit_price: "",
    type: "",
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      setProducts(res.data.products || []);
    } catch (err) {
      toast.error("Failed to load products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      unit: "",
      unit_price: "",
      type: "",
    });
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      unit: product.unit || "",
      unit_price: product.unit_price || "",
      type: product.type || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const loadingToast = toast.loading(
      editingId ? "Updating product..." : "Creating product...",
    );

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, form);
        toast.success("Product updated successfully", { id: loadingToast });
      } else {
        await api.post("/products", form);
        toast.success("Product created successfully", { id: loadingToast });
      }

      setShowForm(false);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product", {
        id: loadingToast,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleProductStatus = (id, currentStatus) => {
    const isDeactivating = currentStatus !== "inactive";
    const endpoint = `/products/${id}/${isDeactivating ? "deactivate" : "activate"}`;
    const request = api.patch(endpoint);

    toast.promise(request, {
      loading: isDeactivating
        ? "Deactivating product..."
        : "Activating product...",
      success: () => {
        fetchProducts();
        return isDeactivating
          ? "Product deactivated"
          : "Product activated successfully";
      },
      error: (err) =>
        err.response?.data?.message || `Failed to alter product status`,
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 transition-all duration-300">
      {/* Dynamic Header Block Banner Layout */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Cooperative Products
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Manage commercial marketplace catalogs, pricing scales, and asset
            categories.
          </p>
        </div>

        <button
          onClick={showForm ? () => setShowForm(false) : openCreateForm}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm tracking-tight border shadow-sm transition duration-150 ${
            showForm
              ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              : "bg-green-600 border-green-700 text-white hover:bg-green-700"
          }`}
        >
          {showForm ? "Cancel Operation" : "＋ Add Product"}
        </button>
      </div>

      {/* Styled Inputs Form Module Panel Grid Layout */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 sm:p-6 space-y-5 transition duration-200"
        >
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-700">
              {editingId
                ? "Modify Product Attributes"
                : "Register Catalog Inventory Item"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Fill out internal unit pricing and categories properly below.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Organic Maize"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-green-500 bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Measurement Unit
              </label>
              <input
                type="text"
                name="unit"
                value={form.unit}
                onChange={handleChange}
                required
                placeholder="e.g. Kg, Litres, Bags"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-green-500 bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Unit Price (KES)
              </label>
              <input
                type="number"
                name="unit_price"
                value={form.unit_price}
                onChange={handleChange}
                required
                placeholder="0.00"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-green-500 bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Category Type
              </label>
              <div className="relative">
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-green-500 bg-white transition appearance-none"
                >
                  <option value="">Select Type</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Crop">Crop</option>
                  <option value="Livestock">Livestock</option>
                  <option value="Feed">Feed</option>
                  <option value="Other">Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-blue-600 border border-blue-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-blue-700 shadow-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
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
                {editingId
                  ? "Update Product Properties"
                  : "Commit Product Item"}
              </span>
            </button>
          </div>
        </form>
      )}

      {/* Main Table Registry Data Presentation Layer */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm font-medium space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-green-600 animate-spin mx-auto"></div>
          <p>Compiling inventory lists...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white p-12 sm:p-16 rounded-2xl border border-slate-100 shadow-sm text-center">
          <p className="text-sm font-semibold text-slate-500">
            No products found inside your catalog.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Click the button above to begin logging operational assets.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider hidden md:table-row">
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Measurement Unit</th>
                  <th className="px-6 py-4">Market Unit Price</th>
                  <th className="px-6 py-4">Inventory Classification</th>
                  <th className="px-6 py-4 text-center">Operational Status</th>
                  <th className="px-6 py-4 text-right">
                    Administrative Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100/80 text-xs sm:text-sm text-slate-600 flex flex-col md:table-row-group">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/40 transition flex flex-col md:table-row p-4 md:p-0 gap-2 md:gap-0 border-b md:border-b-0 border-slate-100"
                  >
                    {/* Product Name Column */}
                    <td className="px-0 md:px-6 md:py-4 font-bold text-slate-800 text-sm md:text-base">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Product Name:
                      </span>
                      {product.name}
                    </td>

                    {/* Measurement Unit Column */}
                    <td className="px-0 md:px-6 md:py-4 font-medium text-slate-500">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Unit:
                      </span>
                      {product.unit}
                    </td>

                    {/* Market Unit Price Column */}
                    <td className="px-0 md:px-6 md:py-4 font-semibold text-slate-700">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Unit Price:
                      </span>
                      KES{" "}
                      {Number(product.unit_price).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    {/* Inventory Classification Column */}
                    <td className="px-0 md:px-6 md:py-4">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Classification:
                      </span>
                      <span className="bg-slate-100 text-slate-600 text-[11px] px-2.5 py-1 rounded-lg font-medium inline-block">
                        {product.type || "Unclassed"}
                      </span>
                    </td>

                    {/* Operational Status Column */}
                    <td className="px-0 md:px-6 md:py-4 text-left md:text-center">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-2">
                        Status:
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 md:py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          product.status === "inactive"
                            ? "bg-rose-50 text-rose-700 border-rose-100"
                            : "bg-green-50 text-green-700 border-green-100"
                        }`}
                      >
                        {product.status || "active"}
                      </span>
                    </td>

                    {/* Administrative Actions Column */}
                    <td className="px-0 md:px-6 md:py-4 text-left md:text-right space-x-2 whitespace-nowrap mt-2 md:mt-0">
                      <button
                        onClick={() => openEditForm(product)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 px-3 py-2 md:py-1.5 rounded-lg transition inline-block"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          toggleProductStatus(product.id, product.status)
                        }
                        className={`text-xs font-bold px-3 py-2 md:py-1.5 rounded-lg transition inline-block ${
                          product.status === "inactive"
                            ? "text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100/80"
                            : "text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100/80"
                        }`}
                      >
                        {product.status === "inactive"
                          ? "Activate"
                          : "Deactivate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
