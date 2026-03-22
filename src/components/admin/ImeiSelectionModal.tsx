import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { IOrder, IProductItem } from "../../shared/models/order-model";
import type { IPayment } from "../../shared/models/payment-model";
import type { IBranch } from "../../shared/models/branch-model";
import { fetchInventoryList } from "../../services/api/api.inventory";
import { shipOrder } from "../../services/api/api.stock-export";
import type { IStockExportItemPayload } from "../../types/stock-export.types";

type OrderWithPayment = IOrder & {
  payment: IPayment;
  userId: { _id: string; email: string; fullName: string; phone: string };
};

interface Props {
  order: OrderWithPayment;
  branches: IBranch[];
  onClose: () => void;
  onSuccess: () => void;
}

interface ItemInventory {
  productItem: IProductItem;
  availableImeis: string[];
  isLoading: boolean;
  error?: string;
}

const ImeiSelectionModal: React.FC<Props> = ({
  order,
  branches,
  onClose,
  onSuccess,
}) => {
  // Prefer the branch already set on the order; fall back to empty (admin must pick)
  const [branchId, setBranchId] = useState<string>(
    order.branchId ? String(order.branchId) : "",
  );

  const [inventories, setInventories] = useState<ItemInventory[]>(
    order.listProduct.map((item) => ({
      productItem: item,
      availableImeis: [],
      isLoading: true,
    })),
  );
  // selectedImeis: key = `${productId}_${variantId}`, value = set of selected IMEI strings
  const [selectedImeis, setSelectedImeis] = useState<
    Record<string, Set<string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!branchId) return; // wait until branch is selected
    // Reset selections when branch changes
    setSelectedImeis({});
    setInventories(
      order.listProduct.map((item) => ({
        productItem: item,
        availableImeis: [],
        isLoading: true,
      })),
    );
    const loadInventories = async () => {
      const results = await Promise.all(
        order.listProduct.map(async (item) => {
          try {
            const res = await fetchInventoryList({
              branchId,
              productId: String(item.productId),
              variantId: String(item.variantId),
              limit: 1000,
            });
            const inventoryItem = res?.items?.[0];
            return {
              productItem: item,
              availableImeis: inventoryItem?.imeiList ?? [],
              isLoading: false,
            };
          } catch {
            return {
              productItem: item,
              availableImeis: [],
              isLoading: false,
              error: "Failed to load inventory",
            };
          }
        }),
      );
      setInventories(results);
    };
    loadInventories();
  }, [order, branchId]);

  const toggleImei = (productId: string, variantId: string, imei: string) => {
    const key = `${productId}_${variantId}`;
    setSelectedImeis((prev) => {
      const current = new Set(prev[key] ?? []);
      if (current.has(imei)) {
        current.delete(imei);
      } else {
        current.add(imei);
      }
      return { ...prev, [key]: current };
    });
  };

  const getSelectedForItem = (
    productId: string,
    variantId: string,
  ): Set<string> => {
    const key = `${productId}_${variantId}`;
    return selectedImeis[key] ?? new Set();
  };

  const isValid = () => {
    if (!branchId) return false;
    return order.listProduct.every((item) => {
      const selected = getSelectedForItem(
        String(item.productId),
        String(item.variantId),
      );
      return selected.size === item.quantity;
    });
  };

  const handleSubmit = async () => {
    if (!isValid()) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const imeiAssignments: IStockExportItemPayload[] = order.listProduct.map(
      (item) => ({
        productId: String(item.productId),
        variantId: String(item.variantId),
        imeiList: Array.from(
          getSelectedForItem(String(item.productId), String(item.variantId)),
        ),
      }),
    );

    const ok = await shipOrder(order._id, { branchId, imeiAssignments });
    setIsSubmitting(false);

    if (ok === true) {
      onSuccess();
    } else {
      setSubmitError(ok);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Assign IMEIs to Ship
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Order #{order._id.slice(-6).toUpperCase()} — select exactly the
                required IMEI(s) per product
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Branch selector — shown when the order has no branch yet */}
            {!order.branchId && (
              <div className="border border-orange-200 bg-orange-50 rounded-xl p-4">
                <label className="block text-sm font-semibold text-orange-800 mb-2">
                  Select fulfillment branch
                </label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full border border-orange-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">— Choose a branch —</option>
                  {branches.map((b) => (
                    <option key={String(b._id)} value={String(b._id)}>
                      {b.name}
                    </option>
                  ))}
                </select>
                {!branchId && (
                  <p className="text-xs text-orange-600 mt-1">
                    You must select a branch to load inventory and ship this
                    order.
                  </p>
                )}
              </div>
            )}

            {branchId &&
              inventories.map(
                ({ productItem, availableImeis, isLoading, error }) => {
                  const productId = String(productItem.productId);
                  const variantId = String(productItem.variantId);
                  const selected = getSelectedForItem(productId, variantId);
                  const needed = productItem.quantity;
                  const done = selected.size === needed;

                  return (
                    <div
                      key={`${productId}_${variantId}`}
                      className={`border rounded-xl p-4 transition-colors ${done ? "border-green-300 bg-green-50/40" : "border-gray-200"}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {productItem.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {productItem.variantName}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${done ? "bg-green-100 text-green-700" : selected.size > 0 ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}`}
                        >
                          {selected.size} / {needed} selected
                        </span>
                      </div>

                      {isLoading ? (
                        <div className="text-sm text-gray-400 italic">
                          Loading available IMEIs...
                        </div>
                      ) : error ? (
                        <div className="text-sm text-red-500">{error}</div>
                      ) : availableImeis.length === 0 ? (
                        <div className="text-sm text-red-500 font-medium">
                          ⚠ No IMEIs available in inventory for this item.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {availableImeis.map((imei) => {
                            const isChecked = selected.has(imei);
                            const isDisabled =
                              !isChecked && selected.size >= needed;
                            return (
                              <label
                                key={imei}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors
                              ${isChecked ? "bg-blue-50 border-blue-400 text-blue-800" : isDisabled ? "opacity-40 cursor-not-allowed border-gray-200" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/40"}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={isDisabled}
                                  onChange={() =>
                                    toggleImei(productId, variantId, imei)
                                  }
                                  className="accent-blue-600"
                                />
                                <span className="font-mono text-xs truncate">
                                  {imei}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                },
              )}

            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                {submitError}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 p-6 border-t border-gray-100 flex items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              {isValid()
                ? "✅ All IMEIs assigned. Ready to ship."
                : "Assign the required number of IMEIs for each product to continue."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isValid() || isSubmitting}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Shipping..." : "Confirm & Ship"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImeiSelectionModal;
