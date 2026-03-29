import { useEffect, useRef, useState } from "react";
import type {
  IDiscountProgram,
  DiscountProgramScope,
  DiscountProgramType,
} from "../../shared/models/discount-program-model";
import type { IProduct } from "../../shared/models/product-model";
import type { ICategory } from "../../shared/models/category-model";
import { fetchProducts } from "../../services/api/api.products";
import { fetchCategories } from "../../services/api/api.categories";

export type DiscountFormData = Omit<IDiscountProgram, "_id">;

const EMPTY_FORM: DiscountFormData = {
  name: "",
  type: "percent",
  value: 0,
  maxDiscount: 0,
  scope: "all",
  applicableIds: [],
  startAt: Date.now(),
  endAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  isActive: true,
};

interface DiscountFormProps {
  editingProgram: IDiscountProgram | null;
  onSubmit: (data: DiscountFormData) => Promise<void>;
  onCancel: () => void;
}

const inputCls =
  "mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-button2/30 focus:border-button2";

const toDatetimeLocal = (ts: number) => {
  const d = new Date(ts);
  // Format: YYYY-MM-DDTHH:mm
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const DiscountForm = ({
  editingProgram,
  onSubmit,
  onCancel,
}: DiscountFormProps) => {
  const initialForm: DiscountFormData = editingProgram
    ? {
        name: editingProgram.name,
        type: editingProgram.type,
        value: editingProgram.value,
        maxDiscount: editingProgram.maxDiscount,
        scope: editingProgram.scope,
        applicableIds: editingProgram.applicableIds ?? [],
        startAt: editingProgram.startAt,
        endAt: editingProgram.endAt,
        isActive: editingProgram.isActive,
      }
    : EMPTY_FORM;

  const [form, setForm] = useState<DiscountFormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Product picker (scope = "product")
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<IProduct[]>([]);
  const [productMeta, setProductMeta] = useState<Record<string, string>>({});
  const productDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Category picker (scope = "category")
  const [allCategories, setAllCategories] = useState<ICategory[]>([]);
  const [categorySearch, setCategorySearch] = useState("");

  useEffect(() => {
    if (form.scope === "category") {
      fetchCategories().then((cats) => setAllCategories(cats ?? []));
    }
  }, [form.scope]);

  const handleProductSearch = (q: string) => {
    setProductSearch(q);
    if (productDebounceRef.current) clearTimeout(productDebounceRef.current);
    if (!q.trim()) {
      setProductResults([]);
      return;
    }
    productDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetchProducts();
        const filtered = (res?.products ?? []).filter((p: IProduct) =>
          p.title.toLowerCase().includes(q.toLowerCase()),
        );
        setProductResults(filtered.slice(0, 20));
      } catch {
        setProductResults([]);
      }
    }, 300);
  };

  const toggleProduct = (product: IProduct) => {
    const id = String(product._id);
    setProductMeta((prev) => ({ ...prev, [id]: product.title }));
    setForm((prev) => ({
      ...prev,
      applicableIds: prev.applicableIds.includes(id)
        ? prev.applicableIds.filter((x) => x !== id)
        : [...prev.applicableIds, id],
    }));
  };

  const toggleCategory = (cat: ICategory) => {
    const id = String(cat._id);
    setForm((prev) => ({
      ...prev,
      applicableIds: prev.applicableIds.includes(id)
        ? prev.applicableIds.filter((x) => x !== id)
        : [...prev.applicableIds, id],
    }));
  };

  const removeId = (id: string) => {
    setForm((prev) => ({
      ...prev,
      applicableIds: prev.applicableIds.filter((x) => x !== id),
    }));
  };

  const handleScopeChange = (scope: DiscountProgramScope) => {
    setForm((prev) => ({ ...prev, scope, applicableIds: [] }));
    setProductSearch("");
    setProductResults([]);
    setCategorySearch("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = allCategories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase()),
  );

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">
          {editingProgram ? "Edit Program" : "New Discount Program"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5 overflow-y-auto max-h-[65vh]">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Program Name
          </label>
          <input
            className={inputCls}
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Summer Sale 2026"
            required
          />
        </div>

        {/* Type + Value + MaxDiscount */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              className={inputCls}
              value={form.type}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  type: e.target.value as DiscountProgramType,
                }))
              }
            >
              <option value="percent">Percent (%)</option>
              <option value="fixed">Fixed (đ)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Value {form.type === "percent" ? "(%)" : "(đ)"}
            </label>
            <input
              type="number"
              min={0}
              className={inputCls}
              value={form.value}
              onChange={(e) =>
                setForm((p) => ({ ...p, value: Number(e.target.value) }))
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Max Cap (đ)
            </label>
            <input
              type="number"
              min={0}
              className={inputCls}
              value={form.maxDiscount}
              onChange={(e) =>
                setForm((p) => ({ ...p, maxDiscount: Number(e.target.value) }))
              }
              placeholder="0 = no cap"
            />
          </div>
        </div>

        {/* Start + End */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start
            </label>
            <input
              type="datetime-local"
              className={inputCls}
              value={toDatetimeLocal(form.startAt)}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  startAt: new Date(e.target.value).getTime(),
                }))
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End
            </label>
            <input
              type="datetime-local"
              className={inputCls}
              value={toDatetimeLocal(form.endAt)}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  endAt: new Date(e.target.value).getTime(),
                }))
              }
              required
            />
          </div>
        </div>

        {/* Scope */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Scope
          </label>
          <div className="flex gap-2">
            {(["all", "category", "product"] as DiscountProgramScope[]).map(
              (s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleScopeChange(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors capitalize ${
                    form.scope === s
                      ? "bg-button2 text-white border-button2"
                      : "bg-white text-gray-600 border-gray-200 hover:border-button2"
                  }`}
                >
                  {s === "all"
                    ? "All Products"
                    : s === "category"
                      ? "By Category"
                      : "By Product"}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Product Picker */}
        {form.scope === "product" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Products
            </label>
            {form.applicableIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.applicableIds.map((id) => (
                  <span
                    key={id}
                    className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-button2 rounded-full text-xs font-medium"
                  >
                    {productMeta[id] ?? id}
                    <button
                      type="button"
                      onClick={() => removeId(id)}
                      className="hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              className={inputCls}
              placeholder="Search products..."
              value={productSearch}
              onChange={(e) => handleProductSearch(e.target.value)}
            />
            {productResults.length > 0 && (
              <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                {productResults.map((prod) => {
                  const id = String(prod._id);
                  const selected = form.applicableIds.includes(id);
                  return (
                    <button
                      type="button"
                      key={id}
                      onClick={() => toggleProduct(prod)}
                      className={`flex items-center w-full px-3 py-2 text-sm text-left hover:bg-gray-50 ${
                        selected
                          ? "bg-red-50 text-button2 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      <span className="flex-1 truncate">{prod.title}</span>
                      {selected && (
                        <svg
                          className="w-4 h-4 shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Category Picker */}
        {form.scope === "category" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Categories
            </label>
            {form.applicableIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.applicableIds.map((id) => {
                  const cat = allCategories.find((c) => c._id === id);
                  return (
                    <span
                      key={id}
                      className="flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium"
                    >
                      {cat?.name ?? id}
                      <button
                        type="button"
                        onClick={() => removeId(id)}
                        className="hover:text-teal-900"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
            <input
              className={inputCls}
              placeholder="Filter categories..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
            />
            <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden max-h-44 overflow-y-auto">
              {filteredCategories.map((cat) => {
                const id = String(cat._id);
                const selected = form.applicableIds.includes(id);
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => toggleCategory(cat)}
                    className={`flex items-center w-full px-3 py-2 text-sm text-left hover:bg-gray-50 ${
                      selected
                        ? "bg-teal-50 text-teal-700 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    <span className="flex-1 truncate">{cat.name}</span>
                    {selected && (
                      <svg
                        className="w-4 h-4 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Active toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              form.isActive ? "bg-button2" : "bg-gray-200"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                form.isActive ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span className="text-sm text-gray-700">
            {form.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-lg text-sm font-medium bg-button2 text-white hover:bg-hoverButton shadow-sm shadow-red-200 transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          {isSubmitting && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {editingProgram ? "Save Changes" : "Create Program"}
        </button>
      </div>
    </form>
  );
};

export default DiscountForm;
