import type { IBranch } from "../../../../shared/models/branch-model";
import { STATUS_META } from "../constants";

interface StockExportFiltersProps {
  branches: IBranch[];
  selectedBranchId: string;
  setSelectedBranchId: (v: string) => void;
  selectedStatus: number | "";
  setSelectedStatus: (v: number | "") => void;
}

const StockExportFilters = ({
  branches,
  selectedBranchId,
  setSelectedBranchId,
  selectedStatus,
  setSelectedStatus,
}: StockExportFiltersProps) => (
  <div className="flex flex-wrap gap-3 mb-6">
    <select
      value={selectedBranchId}
      onChange={(e) => setSelectedBranchId(e.target.value)}
      className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-200 outline-none"
    >
      <option value="">All Branches</option>
      {branches.map((b) => (
        <option key={b._id} value={b._id}>
          {b.name}
        </option>
      ))}
    </select>

    <select
      value={selectedStatus}
      onChange={(e) =>
        setSelectedStatus(e.target.value === "" ? "" : Number(e.target.value))
      }
      className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-200 outline-none"
    >
      <option value="">All Statuses</option>
      {Object.entries(STATUS_META).map(([value, meta]) => (
        <option key={value} value={value}>
          {meta.label}
        </option>
      ))}
    </select>
  </div>
);

export default StockExportFilters;
