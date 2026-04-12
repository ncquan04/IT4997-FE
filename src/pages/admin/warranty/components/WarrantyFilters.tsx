import type { IBranch } from "../../../../shared/models/branch-model";
import { STATUS_META } from "../constants";

interface WarrantyFiltersProps {
  isBranchScoped: boolean;
  branches: IBranch[];
  filterBranch: string;
  setFilterBranch: (v: string) => void;
  filterStatus: number | "";
  setFilterStatus: (v: number | "") => void;
  filterImei: string;
  setFilterImei: (v: string) => void;
  onOpenHistory: () => void;
}

const WarrantyFilters = ({
  isBranchScoped,
  branches,
  filterBranch,
  setFilterBranch,
  filterStatus,
  setFilterStatus,
  filterImei,
  setFilterImei,
  onOpenHistory,
}: WarrantyFiltersProps) => {
  const selectClass =
    "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {!isBranchScoped && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Chi nhánh</label>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className={selectClass}
            >
              <option value="">Tất cả chi nhánh</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Trạng thái</label>
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value === "" ? "" : Number(e.target.value))
            }
            className={selectClass}
          >
            <option value="">Tất cả</option>
            {Object.entries(STATUS_META).map(([code, meta]) => (
              <option key={code} value={code}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>

        <div className={isBranchScoped ? "md:col-span-2" : ""}>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Tìm IMEI / Serial
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={filterImei}
              onChange={(e) => setFilterImei(e.target.value)}
              placeholder="Nhập IMEI hoặc Serial Number..."
              className={selectClass}
            />
            <button
              onClick={onOpenHistory}
              disabled={!filterImei.trim()}
              title="Xem toàn bộ lịch sử sửa chữa của thiết bị này"
              className="shrink-0 px-3 py-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium whitespace-nowrap"
            >
              Lịch sử SC
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarrantyFilters;
