import type { IBranch } from "../../../../shared/models/branch-model";
import { STATUS_STOCK, STATUS_META } from "../constants";

interface StockImportFiltersProps {
  branches: IBranch[];
  selectedBranchId: string;
  setSelectedBranchId: (v: string) => void;
  selectedStatus: number | "";
  setSelectedStatus: (v: number | "") => void;
  searchId: string;
  setSearchId: (v: string) => void;
}

const StockImportFilters = ({
  branches,
  selectedBranchId,
  setSelectedBranchId,
  selectedStatus,
  setSelectedStatus,
  searchId,
  setSearchId,
}: StockImportFiltersProps) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">Search by ID</label>
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="ID"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">Branch</label>
        <select
          value={selectedBranchId}
          onChange={(e) => setSelectedBranchId(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
        >
          <option value="">All Branches</option>
          {branches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">Status</label>
        <select
          value={selectedStatus}
          onChange={(e) =>
            setSelectedStatus(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
        >
          <option value="">All Statuses</option>
          <option value={STATUS_STOCK.PENDING}>{STATUS_META[STATUS_STOCK.PENDING].label}</option>
          <option value={STATUS_STOCK.COMPLETED}>{STATUS_META[STATUS_STOCK.COMPLETED].label}</option>
          <option value={STATUS_STOCK.CANCELLED}>{STATUS_META[STATUS_STOCK.CANCELLED].label}</option>
        </select>
      </div>
    </div>
  </div>
);

export default StockImportFilters;
