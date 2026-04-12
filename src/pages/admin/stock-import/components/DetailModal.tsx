import { motion } from "framer-motion";
import type { IStockImportDetail } from "../../../../types/stock-import.types";
import {
  STATUS_META,
  ALLOWED_TRANSITIONS,
  STATUS_STOCK,
  formatCurrency,
  formatDate,
} from "../constants";

interface DetailModalProps {
  detail: IStockImportDetail | null;
  isLoading: boolean;
  isUpdatingStatus: boolean;
  onClose: () => void;
  onUpdateStatus: (status: number) => void;
}

const DetailModal = ({
  detail,
  isLoading,
  isUpdatingStatus,
  onClose,
  onUpdateStatus,
}: DetailModalProps) => (
  <motion.div
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.95, opacity: 0 }}
    className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[92vh] flex flex-col"
  >
    {/* Header */}
    <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
      <h2 className="text-xl font-bold text-gray-900">Stock Import Detail</h2>
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
    <div className="flex-1 overflow-y-auto p-6">
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">Loading...</div>
      ) : detail ? (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1.5">Status</p>
              <span
                className={`inline-flex px-2.5 py-1 rounded-full text-sm font-semibold ${STATUS_META[detail.status]?.color ?? "bg-gray-100 text-gray-700"}`}
              >
                {STATUS_META[detail.status]?.label ?? detail.status}
              </span>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1.5">Total Cost</p>
              <p className="font-bold text-gray-900 text-base">
                {formatCurrency(detail.totalCost)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1.5">SKU Lines</p>
              <p className="font-bold text-gray-900 text-base">{detail.items.length}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1.5">Total Units</p>
              <p className="font-bold text-gray-900 text-base">
                {detail.items.reduce((s, i) => s + i.quantity, 0)}
              </p>
            </div>
          </div>

          {/* Detail info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="border border-gray-100 rounded-xl p-4 space-y-1.5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Branch</p>
              <p className="font-semibold text-gray-800 text-base">{detail.branchId?.name ?? "—"}</p>
              {detail.branchId?.address && (
                <p className="text-gray-500 text-sm">{detail.branchId.address}</p>
              )}
              {detail.branchId?.phone && (
                <p className="text-gray-500 text-sm">{detail.branchId.phone}</p>
              )}
            </div>

            <div className="border border-gray-100 rounded-xl p-4 space-y-1.5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Supplier</p>
              <p className="font-semibold text-gray-800 text-base">{detail.supplierId?.name ?? "—"}</p>
              {detail.supplierId?.contactPerson && (
                <p className="text-gray-500 text-sm">Contact: {detail.supplierId.contactPerson}</p>
              )}
              {detail.supplierId?.phone && (
                <p className="text-gray-500 text-sm">{detail.supplierId.phone}</p>
              )}
              {detail.supplierId?.email && (
                <p className="text-gray-500 text-sm">{detail.supplierId.email}</p>
              )}
            </div>

            <div className="border border-gray-100 rounded-xl p-4 space-y-1.5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Created By</p>
              <p className="font-semibold text-gray-800 text-base">{detail.createdBy?.userName ?? "—"}</p>
              {detail.createdBy?.email && (
                <p className="text-gray-500 text-sm">{detail.createdBy.email}</p>
              )}
              {detail.createdBy?.role && (
                <p className="text-gray-500 text-sm capitalize">{detail.createdBy.role}</p>
              )}
            </div>

            <div className="border border-gray-100 rounded-xl p-4 space-y-1.5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Info</p>
              <p className="text-gray-600 text-sm">
                <span className="text-gray-400">Created: </span>{formatDate(detail.createdAt)}
              </p>
              <p className="text-gray-600 text-sm">
                <span className="text-gray-400">Updated: </span>{formatDate(detail.updatedAt)}
              </p>
              <p className="text-gray-600 text-xs font-mono break-all">
                <span className="text-gray-400">ID: </span>{detail._id}
              </p>
              {detail.note && (
                <p className="text-gray-600 text-sm pt-1.5 border-t border-gray-100 mt-1">
                  <span className="text-gray-400">Note: </span>{detail.note}
                </p>
              )}
            </div>
          </div>

          {/* Items table */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">
              Items ({detail.items.length})
            </h3>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      <th className="px-4 py-2.5 text-left">Product</th>
                      <th className="px-4 py-2.5 text-left">Variant</th>
                      <th className="px-4 py-2.5 text-center">Qty</th>
                      <th className="px-4 py-2.5 text-right">Unit Cost</th>
                      <th className="px-4 py-2.5 text-right">Line Total</th>
                      <th className="px-4 py-2.5 text-center">IMEIs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {detail.items.map((it, idx) => {
                      const prod = typeof it.productId === "object" ? it.productId : null;
                      const productTitle = prod?.title ?? String(it.productId);
                      const productId = prod?._id ?? String(it.productId);
                      const variantName =
                        prod?.variants?.find(
                          (v) => v._id === String(it.variantId),
                        )?.variantName ?? null;
                      return (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800 text-sm">{productTitle}</p>
                            <p className="font-mono text-gray-400 text-xs mt-0.5 break-all">
                              {productId}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            {variantName && (
                              <p className="font-medium text-gray-800 text-sm">{variantName}</p>
                            )}
                            <p className="font-mono text-gray-400 text-xs mt-0.5 break-all">
                              {String(it.variantId)}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-center text-sm">{it.quantity}</td>
                          <td className="px-4 py-3 text-right text-sm">
                            {formatCurrency(it.unitCost)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-sm">
                            {formatCurrency(it.quantity * it.unitCost)}
                          </td>
                          <td className="px-4 py-3 text-center text-sm">
                            {it.imeiList?.length ?? 0}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Status actions */}
          {(ALLOWED_TRANSITIONS[detail.status] ?? []).length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Update Status
              </p>
              <div className="flex gap-3 flex-wrap">
                {(ALLOWED_TRANSITIONS[detail.status] ?? []).map((nextStatus) => {
                  const meta = STATUS_META[nextStatus];
                  const isCancelled = nextStatus === STATUS_STOCK.CANCELLED;
                  const isCompleted = nextStatus === STATUS_STOCK.COMPLETED;

                  const icon = isCancelled ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  ) : isCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                  );

                  const btnClass = [
                    "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-sm",
                    isCancelled
                      ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 hover:shadow-red-100 hover:shadow-md"
                      : isCompleted
                        ? "bg-green-500 text-white hover:bg-green-600 shadow-green-200 hover:shadow-md"
                        : "bg-blue-500 text-white hover:bg-blue-600 shadow-blue-200 hover:shadow-md",
                  ].join(" ");

                  return (
                    <motion.button
                      key={nextStatus}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={isUpdatingStatus}
                      onClick={() => onUpdateStatus(nextStatus)}
                      className={btnClass}
                    >
                      {isUpdatingStatus ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                      ) : (
                        icon
                      )}
                      {isUpdatingStatus ? "Updating..." : `Mark as ${meta?.label ?? nextStatus}`}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  </motion.div>
);

export default DetailModal;
