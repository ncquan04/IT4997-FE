import type { IBranch } from "../../../../shared/models/branch-model";
import { ROLE_LABELS } from "../constants";

interface EmployeeFiltersProps {
  isAdmin: boolean;
  search: string;
  filterBranch: string;
  filterRole: string;
  filterActive: "" | "true" | "false";
  branches: IBranch[];
  onSearchChange: (v: string) => void;
  onBranchChange: (v: string) => void;
  onRoleChange: (v: string) => void;
  onActiveChange: (v: "" | "true" | "false") => void;
}

export const EmployeeFilters = ({
  isAdmin,
  search,
  filterBranch,
  filterRole,
  filterActive,
  branches,
  onSearchChange,
  onBranchChange,
  onRoleChange,
  onActiveChange,
}: EmployeeFiltersProps) => (
  <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 flex flex-wrap gap-3 items-end">
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
      <input
        className="border rounded-lg px-3 py-2 text-sm w-56"
        placeholder="Name, email, phone..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
    {isAdmin && (
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Branch</label>
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={filterBranch}
          onChange={(e) => onBranchChange(e.target.value)}
        >
          <option value="">All</option>
          {branches.map((b) => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>
      </div>
    )}
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
      <select
        className="border rounded-lg px-3 py-2 text-sm"
        value={filterRole}
        onChange={(e) => onRoleChange(e.target.value)}
      >
        <option value="">All</option>
        {Object.entries(ROLE_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
      <select
        className="border rounded-lg px-3 py-2 text-sm"
        value={filterActive}
        onChange={(e) => onActiveChange(e.target.value as "" | "true" | "false")}
      >
        <option value="">All</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
    </div>
  </div>
);
