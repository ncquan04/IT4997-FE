import type { IBranch } from "../../../../shared/models/branch-model";
import type { IWarrantyListItem } from "../../../../types/warranty.types";
import { STATUS_META, formatDate, getPopulatedName } from "../constants";

interface WarrantyTableProps {
  items: IWarrantyListItem[];
  branches: IBranch[];
  isBranchScoped: boolean;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onOpenDetail: (id: string) => void;
  onPageChange: (page: number) => void;
}

const WarrantyTable = ({
  items,
  branches,
  isBranchScoped,
  isLoading,
  currentPage,
  totalPages,
  onOpenDetail,
  onPageChange,
}: WarrantyTableProps) => {
  const getItemBranch = (item: IWarrantyListItem) =>
    getPopulatedName(
      item.branchId,
      (id) => branches.find((b) => b._id === id)?.name ?? `...${id.slice(-6)}`,
    );

  const getItemCustomer = (item: IWarrantyListItem) =>
    getPopulatedName(item.customerId, (id) => `...${id.slice(-6)}`);

  const getItemProduct = (item: IWarrantyListItem) => {
    if (typeof item.productId === "object" && item.productId !== null) {
      return (item.productId as any).title ?? "—";
    }
    return typeof item.productId === "string"
      ? `...${item.productId.slice(-6)}`
      : "—";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">Đang tải...</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
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
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Không có phiếu bảo hành nào.</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: "860px" }}>
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-4 py-3 text-left">IMEI / Serial</th>
                <th className="px-4 py-3 text-left">Khách hàng</th>
                <th className="px-4 py-3 text-left">Sản phẩm</th>
                {!isBranchScoped && <th className="px-4 py-3 text-left">Chi nhánh</th>}
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-left">Ngày tiếp nhận</th>
                <th className="px-4 py-3 text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => {
                const meta = STATUS_META[item.status] ?? {
                  label: String(item.status),
                  color: "bg-gray-100 text-gray-600",
                };
                return (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {item.imeiOrSerial}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{getItemCustomer(item)}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-50 truncate">
                      {getItemProduct(item)}
                    </td>
                    {!isBranchScoped && (
                      <td className="px-4 py-3 text-gray-600">{getItemBranch(item)}</td>
                    )}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.color}`}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onOpenDetail(item._id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                        title="Xem chi tiết"
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
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 py-4 border-t border-gray-100">
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Trước
          </button>
          <span className="text-sm text-gray-600">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default WarrantyTable;
