import { useEffect, useState } from "react";
import { useToast } from "../../contexts/ToastContext";
import type { ICoupon } from "../../shared/models/coupon-model";
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../../services/api/api.coupon";

const EMPTY_FORM: Omit<ICoupon, "_id" | "usedCount"> = {
  code: "",
  type: "percent",
  value: 0,
  minOrderValue: 0,
  maxDiscount: 0,
  maxUsage: 0,
  expiredAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // default 7 days
  isActive: true,
};

const CouponManagementPage = () => {
  const { showToast } = useToast();

  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<ICoupon | null>(null);
  const [form, setForm] =
    useState<Omit<ICoupon, "_id" | "usedCount">>(EMPTY_FORM);

  const loadCoupons = async () => {
    setIsLoading(true);
    const data = await getAllCoupons();
    setCoupons(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openCreate = () => {
    setEditingCoupon(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEdit = (coupon: ICoupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrderValue: coupon.minOrderValue,
      maxDiscount: coupon.maxDiscount,
      maxUsage: coupon.maxUsage,
      expiredAt: coupon.expiredAt,
      isActive: coupon.isActive,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCoupon) {
      const result = await updateCoupon(editingCoupon._id, form);
      if (result) {
        showToast("Coupon updated successfully", "success");
        setIsFormOpen(false);
        loadCoupons();
      } else {
        showToast("Failed to update coupon", "error");
      }
    } else {
      const result = await createCoupon(form);
      if (result) {
        showToast("Coupon created successfully", "success");
        setIsFormOpen(false);
        loadCoupons();
      } else {
        showToast("Failed to create coupon", "error");
      }
    }
  };

  const handleDelete = async (coupon: ICoupon) => {
    if (!window.confirm(`Delete coupon "${coupon.code}"?`)) return;
    const ok = await deleteCoupon(coupon._id);
    if (ok) {
      showToast("Coupon deleted", "success");
      loadCoupons();
    } else {
      showToast("Failed to delete coupon", "error");
    }
  };

  const handleFieldChange = (
    field: keyof typeof EMPTY_FORM,
    value: string | number | boolean,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Coupon Management</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          + New Coupon
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Min Order</th>
              <th className="px-4 py-3">Max Discount</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3">Expired At</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-400">
                  No coupons found
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-semibold">
                    {c.code}
                  </td>
                  <td className="px-4 py-3 capitalize">{c.type}</td>
                  <td className="px-4 py-3">
                    {c.type === "percent"
                      ? `${c.value}%`
                      : `${c.value.toLocaleString()}đ`}
                  </td>
                  <td className="px-4 py-3">
                    {c.minOrderValue.toLocaleString()}đ
                  </td>
                  <td className="px-4 py-3">
                    {c.maxDiscount > 0
                      ? `${c.maxDiscount.toLocaleString()}đ`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {c.usedCount}/{c.maxUsage === 0 ? "∞" : c.maxUsage}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(c.expiredAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        c.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => openEdit(c)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingCoupon ? "Edit Coupon" : "Create Coupon"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Code — readonly when editing */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Code
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) =>
                    handleFieldChange("code", e.target.value.toUpperCase())
                  }
                  disabled={!!editingCoupon}
                  required
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-100"
                  placeholder="e.g. SUMMER20"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => handleFieldChange("type", e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="percent">Percent (%)</option>
                    <option value="fixed">Fixed (đ)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">
                    Value {form.type === "percent" ? "(%)" : "(đ)"}
                  </label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={(e) =>
                      handleFieldChange("value", Number(e.target.value))
                    }
                    min={0}
                    required
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">
                    Min Order (đ)
                  </label>
                  <input
                    type="number"
                    value={form.minOrderValue}
                    onChange={(e) =>
                      handleFieldChange("minOrderValue", Number(e.target.value))
                    }
                    min={0}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">
                    Max Discount (đ)
                  </label>
                  <input
                    type="number"
                    value={form.maxDiscount}
                    onChange={(e) =>
                      handleFieldChange("maxDiscount", Number(e.target.value))
                    }
                    min={0}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="0 = no cap"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">
                    Max Usage
                  </label>
                  <input
                    type="number"
                    value={form.maxUsage}
                    onChange={(e) =>
                      handleFieldChange("maxUsage", Number(e.target.value))
                    }
                    min={0}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="0 = unlimited"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">
                    Expired At
                  </label>
                  <input
                    type="date"
                    value={new Date(form.expiredAt).toISOString().split("T")[0]}
                    onChange={(e) =>
                      handleFieldChange(
                        "expiredAt",
                        new Date(e.target.value).getTime(),
                      )
                    }
                    required
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) =>
                    handleFieldChange("isActive", e.target.checked)
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  {editingCoupon ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagementPage;
