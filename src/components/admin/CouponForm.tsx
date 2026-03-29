import { useRef, useState } from "react";
import type { ICoupon } from "../../shared/models/coupon-model";
import type { IProduct } from "../../shared/models/product-model";
import { fetchProducts } from "../../services/api/api.products";

export type CouponFormData = Omit<ICoupon, "_id" | "usedCount">;

const EMPTY_FORM: CouponFormData = {
  code: "",
  type: "percent",
  value: 0,
  minOrderValue: 0,
  maxDiscount: 0,
  maxUsage: 0,
  expiredAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  isActive: true,
  applicableProducts: [],
};

interface CouponFormProps {
  editingCoupon: ICoupon | null;
  onSubmit: (data: CouponFormData) => Promise<void>;
  onCancel: () => void;
}

const inputCls =
  "mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-button2/30 focus:border-button2";

const CouponForm = ({ editingCoupon, onSubmit, onCancel }: CouponFormProps) => {
  const initialForm: CouponFormData = editingCoupon
    ? {
        code: editingCoupon.code,
        type: editingCoupon.type,
        value: editingCoupon.value,
        minOrderValue: editingCoupon.minOrderValue,
        maxDiscount: editingCoupon.maxDiscount,
        maxUsage: editingCoupon.maxUsage,
        expiredAt: editingCoupon.expiredAt,
        isActive: editingCoupon.isActive,
        applicableProducts: editingCoupon.applicableProducts ?? [],
      }
    : EMPTY_FORM;

  const [form, setForm] = useState<CouponFormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Product picker
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<IProduct[]>([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedProductMeta, setSelectedProductMeta] = useState<
    Record<string, string>
  >(() => {
    const meta: Record<string, string> = {};
    (editingCoupon?.applicableProducts ?? []).forEach((id) => (meta[id] = id));
    return meta;
  });

  const handleFieldChange = (
    field: keyof CouponFormData,
    value: string | number | boolean,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProductSearchChange = (query: string) => {
    setProductSearch(query);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!query.trim()) {
      setProductResults([]);
      return;
    }
    searchTimerRef.current = setTimeout(async () => {
      setProductSearchLoading(true);
      const res = await fetchProducts(undefined, 1);
      if (res) {
        const lower = query.toLowerCase();
        setProductResults(
          res.products.filter((p) => p.title.toLowerCase().includes(lower)),
        );
      }
      setProductSearchLoading(false);
    }, 300);
  };

  const handleToggleProduct = (product: IProduct) => {
    const id = product._id;
    setForm((prev) => {
      const current = prev.applicableProducts ?? [];
      return {
        ...prev,
        applicableProducts: current.includes(id)
          ? current.filter((x) => x !== id)
          : [...current, id],
      };
    });
    setSelectedProductMeta((prev) => {
      if (prev[id]) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: product.title };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(form);
    setIsSubmitting(false);
  };

  return (
    <>
      {/* Modal header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">
          {editingCoupon ? "Edit Coupon" : "Create Coupon"}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {editingCoupon
            ? `Editing: ${editingCoupon.code}`
            : "Fill in the details below."}
        </p>
      </div>

      {/* Form body */}
      <form
        id="coupon-form"
        onSubmit={handleSubmit}
        className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto"
      >
        {/* Code */}
        <div>
          <label className="text-sm font-semibold text-gray-700">Code</label>
          <input
            type="text"
            value={form.code}
            onChange={(e) =>
              handleFieldChange("code", e.target.value.toUpperCase())
            }
            disabled={!!editingCoupon}
            required
            placeholder="e.g. SUMMER20"
            className={`${inputCls} disabled:bg-gray-50 font-mono tracking-wider`}
          />
        </div>

        {/* Type + Value */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-700">Type</label>
            <select
              value={form.type}
              onChange={(e) => handleFieldChange("type", e.target.value)}
              className={inputCls}
            >
              <option value="percent">Percent (%)</option>
              <option value="fixed">Fixed (đ)</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-700">
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
              className={inputCls}
            />
          </div>
        </div>

        {/* Min Order + Max Discount */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-700">
              Min Order (đ)
            </label>
            <input
              type="number"
              value={form.minOrderValue}
              onChange={(e) =>
                handleFieldChange("minOrderValue", Number(e.target.value))
              }
              min={0}
              className={inputCls}
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-700">
              Max Discount (đ)
            </label>
            <input
              type="number"
              value={form.maxDiscount}
              onChange={(e) =>
                handleFieldChange("maxDiscount", Number(e.target.value))
              }
              min={0}
              placeholder="0 = no cap"
              className={inputCls}
            />
          </div>
        </div>

        {/* Max Usage + Expires */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-700">
              Max Usage
            </label>
            <input
              type="number"
              value={form.maxUsage}
              onChange={(e) =>
                handleFieldChange("maxUsage", Number(e.target.value))
              }
              min={0}
              placeholder="0 = unlimited"
              className={inputCls}
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-700">
              Expires At
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
              className={inputCls}
            />
          </div>
        </div>

        {/* Active toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => handleFieldChange("isActive", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-button2 transition-colors" />
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
          </div>
          <span className="text-sm font-semibold text-gray-700">Active</span>
        </label>

        {/* Product picker */}
        <div>
          <label className="text-sm font-semibold text-gray-700">
            Applicable Products
            <span className="ml-1.5 text-xs font-normal text-gray-400">
              (leave empty → applies to entire order)
            </span>
          </label>

          {/* Selected tags */}
          {form.applicableProducts && form.applicableProducts.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.applicableProducts.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium"
                >
                  <span
                    className="max-w-40 truncate"
                    title={selectedProductMeta[id] ?? id}
                  >
                    {selectedProductMeta[id] ?? id}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleProduct({
                        _id: id,
                        title: selectedProductMeta[id] ?? id,
                      } as IProduct)
                    }
                    className="hover:text-red-500 transition-colors ml-0.5 font-bold leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <input
            type="text"
            value={productSearch}
            onChange={(e) => handleProductSearchChange(e.target.value)}
            placeholder="Search products to restrict..."
            className={`mt-2 ${inputCls}`}
          />
          {productSearchLoading && (
            <p className="text-xs text-gray-400 mt-1">Searching...</p>
          )}
          {productResults.length > 0 && (
            <ul className="mt-1 border border-gray-200 rounded-lg max-h-40 overflow-y-auto divide-y divide-gray-100 shadow-sm">
              {productResults.map((p) => {
                const selected = (form.applicableProducts ?? []).includes(
                  p._id,
                );
                return (
                  <li key={p._id}>
                    <button
                      type="button"
                      onClick={() => handleToggleProduct(p)}
                      className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between transition-colors ${
                        selected
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className="truncate">{p.title}</span>
                      {selected && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="shrink-0 ml-2 text-blue-500"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </form>

      {/* Modal footer */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-gray-200 transition-colors text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="coupon-form"
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-lg bg-button2 hover:bg-hoverButton text-white font-semibold shadow-md transition-all text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {editingCoupon ? "Save Changes" : "Create Coupon"}
        </button>
      </div>
    </>
  );
};

export default CouponForm;
