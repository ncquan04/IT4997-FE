import { motion } from "framer-motion";
import type { ICoupon } from "../../shared/models/coupon-model";

interface CouponTableProps {
  coupons: ICoupon[];
  isLoading: boolean;
  onEdit: (coupon: ICoupon) => void;
  onDelete: (coupon: ICoupon) => void;
}

const CouponTable = ({
  coupons,
  isLoading,
  onEdit,
  onDelete,
}: CouponTableProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-500">
        <div className="w-12 h-12 border-4 border-button2 border-t-transparent rounded-full animate-spin mb-4" />
        Loading coupons...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {[
              "Code",
              "Type",
              "Value",
              "Min Order",
              "Max Cap",
              "Usage",
              "Scope",
              "Expires",
              "Status",
            ].map((col) => (
              <th
                key={col}
                className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
            <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {coupons.length === 0 ? (
            <tr>
              <td colSpan={10} className="p-12 text-center text-gray-400">
                <div className="flex flex-col items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mb-4 text-gray-300"
                  >
                    <path d="M20 12V22H4V12" />
                    <path d="M22 7H2v5h20V7z" />
                    <path d="M12 22V7" />
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                  </svg>
                  <p>No coupons found.</p>
                </div>
              </td>
            </tr>
          ) : (
            coupons.map((c, index) => (
              <motion.tr
                key={c._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors group"
              >
                <td className="p-5 font-mono font-bold text-gray-900 tracking-wider">
                  {c.code}
                </td>
                <td className="p-5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      c.type === "percent"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {c.type === "percent" ? "Percent" : "Fixed"}
                  </span>
                </td>
                <td className="p-5 font-semibold text-gray-800">
                  {c.type === "percent"
                    ? `${c.value}%`
                    : `${c.value.toLocaleString()}đ`}
                </td>
                <td className="p-5 text-gray-600">
                  {c.minOrderValue > 0
                    ? `${c.minOrderValue.toLocaleString()}đ`
                    : "—"}
                </td>
                <td className="p-5 text-gray-600">
                  {c.maxDiscount > 0
                    ? `${c.maxDiscount.toLocaleString()}đ`
                    : "—"}
                </td>
                <td className="p-5 text-gray-600">
                  <span className="font-medium">{c.usedCount}</span>
                  <span className="text-gray-400">
                    /{c.maxUsage === 0 ? "∞" : c.maxUsage}
                  </span>
                </td>
                <td className="p-5">
                  {c.applicableProducts && c.applicableProducts.length > 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {c.applicableProducts.length} product
                      {c.applicableProducts.length > 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">All</span>
                  )}
                </td>
                <td className="p-5 text-gray-600 text-sm">
                  {new Date(c.expiredAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="p-5">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      c.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        c.isActive ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-5 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => onEdit(c)}
                      className="p-2 text-button2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(c)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CouponTable;
