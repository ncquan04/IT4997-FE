import { motion } from "framer-motion";
import { useAuth } from "../../../../contexts/AuthContext";
import { UserRole } from "../../../../shared/models/user-model";
import type { IStockTransferDetail } from "../../../../types/stock-transfer.types";
import {
  ALLOWED_TRANSITIONS,
  STATUS_META,
  STATUS_TRANSFER,
  formatDate,
} from "../constants";

interface StockTransferDetailModalProps {
  detail: IStockTransferDetail | null;
  isLoading: boolean;
  isUpdatingStatus: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: number) => void;
}

const StockTransferDetailModal = ({
  detail,
  isLoading,
  isUpdatingStatus,
  onClose,
  onStatusChange,
}: StockTransferDetailModalProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  const fromId = detail?.fromBranchId?._id;
  const toId = detail?.toBranchId?._id;
  const userBranchId = user?.branchId;

  // Only roles the BE status endpoint accepts may mutate; otherwise the buttons
  // would just 403. (Matches verifyRole([ADMIN, MANAGER, WAREHOUSE]).)
  const canMutate =
    isAdmin ||
    user?.role === UserRole.MANAGER ||
    user?.role === UserRole.WAREHOUSE;

  // Approve outgoing transfer: only the FROM-branch staff (or admin).
  const canApprove =
    canMutate && (isAdmin || (!!userBranchId && fromId === userBranchId));
  // Receive incoming transfer: only the TO-branch staff (or admin).
  const canComplete =
    canMutate && (isAdmin || (!!userBranchId && toId === userBranchId));
  // Cancel: either party (or admin).
  const canCancel =
    canMutate &&
    (isAdmin ||
      (!!userBranchId && (fromId === userBranchId || toId === userBranchId)));

  const isTransitionAllowed = (nextStatus: number) => {
    if (nextStatus === STATUS_TRANSFER.IN_TRANSIT) return canApprove;
    if (nextStatus === STATUS_TRANSFER.COMPLETED) return canComplete;
    if (nextStatus === STATUS_TRANSFER.CANCELLED) return canCancel;
    return false;
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
        <h2 className="text-xl font-bold text-gray-900">Stock Transfer Detail</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">Loading...</div>
        ) : detail ? (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1.5">Status</p>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-sm font-semibold ${STATUS_META[detail.status]?.color ?? "bg-gray-100 text-gray-700"}`}>
                  {STATUS_META[detail.status]?.label ?? detail.status}
                </span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1.5">From Branch</p>
                <p className="text-sm font-medium text-gray-800">{detail.fromBranchId?.name ?? "—"}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1.5">To Branch</p>
                <p className="text-sm font-medium text-gray-800">{detail.toBranchId?.name ?? "—"}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1.5">Created By</p>
                <p className="text-sm font-medium text-gray-800">
                  {detail.createdBy?.userName ?? "System"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(detail.createdAt)}</p>
              </div>
            </div>

            {detail.orderId && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                Linked Order:{" "}
                <span className="font-mono font-semibold">
                  #{String(detail.orderId).slice(-8).toUpperCase()}
                </span>
              </div>
            )}

            {detail.note && (
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
                <span className="font-semibold">Note:</span> {detail.note}
              </div>
            )}

            {/* Items */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-3">
                Items ({detail.items.length})
              </h3>
              <div className="space-y-3">
                {detail.items.map((item, idx) => {
                  const product = typeof item.productId === "string" ? null : item.productId;
                  const variantName = product
                    ? product.variants.find((v) => v._id === String(item.variantId))?.variantName
                    : null;
                  return (
                    <div key={idx} className="rounded-xl border border-gray-100 p-4 bg-gray-50/50">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {product?.title ?? String(item.productId)}
                          </p>
                          {variantName && (
                            <p className="text-xs text-gray-500 mt-0.5">{variantName}</p>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      {(item.imeiList?.length ?? 0) > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {item.imeiList!.map((imei) => (
                            <span
                              key={imei}
                              className="font-mono text-xs bg-white border border-gray-200 rounded px-2 py-0.5 text-gray-600"
                            >
                              {imei}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status actions */}
            {(ALLOWED_TRANSITIONS[detail.status] ?? []).length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {(ALLOWED_TRANSITIONS[detail.status] ?? [])
                  .filter(isTransitionAllowed)
                  .map((nextStatus) => {
                    const meta = STATUS_META[nextStatus];
                    const isComplete = nextStatus === STATUS_TRANSFER.COMPLETED;
                    const isApprove = nextStatus === STATUS_TRANSFER.IN_TRANSIT;
                    const buttonStyle = isComplete
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : isApprove
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : "bg-red-100 hover:bg-red-200 text-red-700";
                    return (
                      <button
                        key={nextStatus}
                        onClick={() => onStatusChange(detail._id, nextStatus)}
                        disabled={isUpdatingStatus}
                        className={`px-5 py-2 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 ${buttonStyle}`}
                      >
                        {isUpdatingStatus ? "Updating..." : `Mark as ${meta?.label}`}
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
};

export default StockTransferDetailModal;
