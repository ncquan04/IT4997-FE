import { motion } from "framer-motion";
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

const InventoryTable = ({
  items,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
}: InventoryTableProps) => {
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
      <div className="overflow-x-auto">
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
              </motion.tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-400">
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
    </div>
  );
};

export default InventoryTable;
