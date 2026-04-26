import type { IStockImportListItem } from "../../../../types/stock-import.types";
import { STATUS_META, formatDate, formatCurrency } from "../constants";

interface StockImportTableProps {
  items: IStockImportListItem[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  searchId: string;
  getBranchDisplay: (item: IStockImportListItem) => string;
  getCreatorDisplay: (item: IStockImportListItem) => string;
  getSupplierDisplay: (item: IStockImportListItem) => string;
  onOpenDetail: (id: string) => void;
  onPageChange: (page: number) => void;
}

const StockImportTable = ({
  items,
  isLoading,
  currentPage,
  totalPages,
  searchId,
  getBranchDisplay,
  getCreatorDisplay,
  getSupplierDisplay,
  onOpenDetail,
  onPageChange,
}: StockImportTableProps) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    {isLoading ? (
      <div className="flex items-center justify-center py-20 text-gray-400">
        Loading...
      </div>
    ) : items.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
        <span>No stock imports found.</span>
      </div>
    ) : (
      <>
        {/* ── Mobile card list (< md) ── */}
        <div className="block md:hidden divide-y divide-gray-100">
          {items
            .filter((item) =>
              searchId.trim()
                ? item._id.toLowerCase().includes(searchId.trim().toLowerCase())
                : true,
            )
            .map((item) => {
              const statusMeta = STATUS_META[item.status] ?? {
                label: String(item.status),
                color: "bg-gray-100 text-gray-700",
              };
              return (
                <div key={item._id} className="p-4 space-y-2">
                  {/* ID + status */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs text-gray-400 break-all">
                      {item._id}
                    </span>
                    <span
                      className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMeta.color}`}
                    >
                      {statusMeta.label}
                    </span>
                  </div>

                  {/* Branch + supplier */}
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm">
                    <span className="font-medium text-gray-800">
                      {getBranchDisplay(item)}
                    </span>
                    <span className="text-gray-500">
                      {getSupplierDisplay(item)}
                    </span>
                  </div>

                  {/* Items count + total */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">
                      {item.items?.length ?? 0} item(s)
                    </span>
                    <span className="font-semibold text-gray-800">
                      {formatCurrency(item.totalCost)}
                    </span>
                  </div>

                  {/* Creator + date + action */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <div className="text-xs text-gray-400">
                      {getCreatorDisplay(item)} · {formatDate(item.createdAt)}
                    </div>
                    <button
                      onClick={() => onOpenDetail(item._id)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      title="View detail"
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
                  </div>
                </div>
              );
            })}
        </div>

        {/* ── Desktop table (≥ md) ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: "900px" }}>
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-4 py-3 text-left whitespace-nowrap">ID</th>
                <th className="px-4 py-3 text-left">Branch</th>
                <th className="px-4 py-3 text-left">Supplier</th>
                <th className="px-4 py-3 text-center">Items</th>
                <th className="px-4 py-3 text-right">Total Cost</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-left">Created By</th>
                <th className="px-4 py-3 text-left">Created At</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items
                .filter((item) =>
                  searchId.trim()
                    ? item._id
                        .toLowerCase()
                        .includes(searchId.trim().toLowerCase())
                    : true,
                )
                .map((item) => {
                  const statusMeta = STATUS_META[item.status] ?? {
                    label: String(item.status),
                    color: "bg-gray-100 text-gray-700",
                  };
                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                        {item._id}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {getBranchDisplay(item)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {getSupplierDisplay(item)}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {item.items?.length ?? 0}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">
                        {formatCurrency(item.totalCost)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMeta.color}`}
                        >
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {getCreatorDisplay(item)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => onOpenDetail(item._id)}
                          title="View detail"
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
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </>
    )}

    {totalPages > 1 && (
      <div className="flex items-center justify-center gap-3 py-4 border-t border-gray-100">
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} / {totalPages}
        </span>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
        >
          Next
        </button>
      </div>
    )}
  </div>
);

export default StockImportTable;
