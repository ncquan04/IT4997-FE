import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { IInventoryItem } from "../../types/inventory.types";

interface InventoryTableProps {
  items: IInventoryItem[];
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const formatPrice = (price?: number) => {
  if (typeof price !== "number") return "-";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// Nút xem IMEI — icon-only, đồng bộ với nút "View" eye ở StockImportTable.
const ViewImeiButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    title="Xem IMEI"
    aria-label="Xem IMEI"
    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition-colors"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  </button>
);

const InventoryTable = ({
  items,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
}: InventoryTableProps) => {
  const [viewItem, setViewItem] = useState<IInventoryItem | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-500">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        Loading inventory...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="block md:hidden divide-y divide-gray-100">
        {items.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            No inventory records found.
          </div>
        ) : (
          items.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.03 }}
              className="p-4 space-y-2"
            >
              {/* Product + variant */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">
                    {item.product?.title ?? "Unknown product"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.product?.brand ?? "-"}
                  </p>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.quantity > 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  Qty: {item.quantity}
                </span>
              </div>

              {/* Variant */}
              <div className="text-sm text-gray-700">
                {item.variant?.variantName ?? "Unknown variant"}
                <span className="ml-2 text-xs text-gray-400">
                  SKU: {item.variant?.sku ?? "-"}
                </span>
              </div>

              {/* Branch + price + date */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <span>📍 {item.branch?.name ?? "-"}</span>
                <span className="font-semibold text-gray-800">
                  {formatPrice(item.variant?.salePrice ?? item.variant?.price)}
                </span>
                <span>
                  {new Date(item.updatedAt).toLocaleDateString("vi-VN")}
                </span>
              </div>

              {/* Action */}
              <div className="flex justify-end pt-1">
                <ViewImeiButton onClick={() => setViewItem(item)} />
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider">
                Product
              </th>
              <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider">
                Variant
              </th>
              <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider">
                Branch
              </th>
              <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider">
                Quantity
              </th>
              <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider">
                Price
              </th>
              <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider">
                Updated
              </th>
              <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <motion.tr
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
                className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
              >
                <td className="p-5">
                  <div className="font-semibold text-gray-800">
                    {item.product?.title ?? "Unknown product"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.product?.brand ?? "-"}
                  </div>
                </td>
                <td className="p-5">
                  <div className="font-medium text-gray-700">
                    {item.variant?.variantName ?? "Unknown variant"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    SKU: {item.variant?.sku ?? "-"}
                  </div>
                </td>
                <td className="p-5">
                  <div className="font-medium text-gray-700">
                    {item.branch?.name ?? "Unknown branch"}
                  </div>
                  <div
                    className="text-xs text-gray-500 mt-1 line-clamp-1"
                    title={item.branch?.address ?? ""}
                  >
                    {item.branch?.address ?? "-"}
                  </div>
                </td>
                <td className="p-5">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.quantity > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.quantity}
                  </span>
                </td>
                <td className="p-5 text-gray-800 font-semibold">
                  {formatPrice(item.variant?.salePrice ?? item.variant?.price)}
                </td>
                <td className="p-5 text-gray-600 text-sm">
                  {new Date(item.updatedAt).toLocaleString("vi-VN")}
                </td>
                <td className="p-5 text-center">
                  <ViewImeiButton onClick={() => setViewItem(item)} />
                </td>
              </motion.tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="p-12 text-center text-gray-400">
                  No inventory records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="text-sm text-gray-500">
            Showing page <span className="font-semibold">{currentPage}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {viewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setViewItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                <h2 className="text-xl font-bold text-gray-900">
                  IMEI tồn kho
                </h2>
                <button
                  onClick={() => setViewItem(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Đóng"
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

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1.5">Sản phẩm</p>
                    <p className="text-sm font-medium text-gray-800">
                      {viewItem.product?.title ?? "—"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1.5">Phiên bản</p>
                    <p className="text-sm font-medium text-gray-800">
                      {viewItem.variant?.variantName ?? "—"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1.5">Chi nhánh</p>
                    <p className="text-sm font-medium text-gray-800">
                      {viewItem.branch?.name ?? "—"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1.5">Số lượng</p>
                    <p className="text-sm font-medium text-gray-800">
                      {viewItem.quantity}
                    </p>
                  </div>
                </div>

                {/* IMEI list */}
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-3">
                    IMEI còn lại ({viewItem.imeiList?.length ?? 0})
                  </h3>
                  {viewItem.imeiList && viewItem.imeiList.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {viewItem.imeiList.map((imei) => (
                        <span
                          key={imei}
                          className="font-mono text-xs bg-white border border-gray-200 rounded px-2 py-0.5 text-gray-600"
                        >
                          {imei}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      Sản phẩm này không quản lý theo IMEI (hoặc kho đang trống).
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InventoryTable;
