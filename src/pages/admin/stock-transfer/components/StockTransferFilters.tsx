import type { IBranch } from "../../../../shared/models/branch-model";
import { STATUS_META } from "../constants";

interface StockTransferFiltersProps {
  branches: IBranch[];
  selectedBranchId: string;
  setSelectedBranchId: (v: string) => void;
  selectedStatus: number | "";
  setSelectedStatus: (v: number | "") => void;
  viewOption: "both" | "from" | "to";
  setViewOption: (v: "both" | "from" | "to") => void;
}

const StockTransferFilters = ({
  branches,
  selectedBranchId,
  setSelectedBranchId,
  selectedStatus,
  setSelectedStatus,
  viewOption,
  setViewOption,
}: StockTransferFiltersProps) => (
  <div className="flex flex-wrap gap-3 mb-6">
    <select
      value={selectedBranchId}
      onChange={(e) => setSelectedBranchId(e.target.value)}
      className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
    >
      <option value="">All Branches</option>
      {branches.map((b) => (
        <option key={b._id} value={b._id}>
          {b.name}
        </option>
      ))}
    </select>

    <select
      value={viewOption}
      onChange={(e) => setViewOption(e.target.value as "both" | "from" | "to")}
      className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
    >
      <option value="both">Both (Sending/Receiving)</option>
      <option value="from">Sending Only</option>
      <option value="to">Receiving Only</option>
    </select>

    <select
      value={selectedStatus}
      onChange={(e) =>
        setSelectedStatus(e.target.value === "" ? "" : Number(e.target.value))
      }
      className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
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

export default StockTransferFilters;
