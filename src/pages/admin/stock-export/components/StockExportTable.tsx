import { motion } from "framer-motion";
import type {
  IStockExportListItem,
} from "../../../../types/stock-export.types";
import {
  STATUS_META,
  REASON_LABELS,
  REASON_COLORS,
  formatDate,
} from "../constants";

interface StockExportTableProps {
  items: IStockExportListItem[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  getBranchName: (branchId: string | { _id: string; name: string }) => string;
  getCreatorName: (createdBy: string | { _id: string; userName: string }) => string;
  onOpenDetail: (id: string) => void;
  onPageChange: (page: number) => void;
}

const StockExportTable = ({
  items,
  isLoading,
  currentPage,
  totalPages,
  getBranchName,
  getCreatorName,
  onOpenDetail,
  onPageChange,
}: StockExportTableProps) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {["Export ID", "Branch", "Reason", "Items", "Created By", "Status", "Date", "Actions"].map((h) => (
              <th
                key={h}
                className="p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={8} className="p-12 text-center text-gray-400">Loading...</td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={8} className="p-12 text-center text-gray-400">No stock exports found.</td>
            </tr>
          ) : (
            items.map((item, idx) => (
              <motion.tr
                key={item._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
                className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
              >
                <td className="p-4 font-mono text-sm text-gray-600">
                  #{item._id.slice(-8).toUpperCase()}
                </td>
                <td className="p-4 text-sm text-gray-800">{getBranchName(item.branchId)}</td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${REASON_COLORS[item.reason] ?? "bg-gray-100 text-gray-700"}`}
                  >
                    {REASON_LABELS[item.reason] ?? item.reason}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-700">{item.items.length} item(s)</td>
                <td className="p-4 text-sm text-gray-700">{getCreatorName(item.createdBy)}</td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_META[item.status]?.color ?? "bg-gray-100 text-gray-700"}`}
                  >
                    {STATUS_META[item.status]?.label ?? item.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">{formatDate(item.createdAt)}</td>
                <td className="p-4">
                  <button
                    onClick={() => onOpenDetail(item._id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    View
                  </button>
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {totalPages > 1 && (
      <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50/50">
        <span className="text-sm text-gray-500">
          Page <b>{currentPage}</b> of <b>{totalPages}</b>
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-white border border-gray-300 disabled:opacity-50 text-sm"
          >
            Prev
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-white border border-gray-300 disabled:opacity-50 text-sm"
          >
            Next
          </button>
        </div>
      </div>
    )}
  </div>
);

export default StockExportTable;
