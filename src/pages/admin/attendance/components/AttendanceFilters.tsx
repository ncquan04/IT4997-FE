import type { IBranch } from "../../../../shared/models/branch-model";
import type { IEmployee } from "../../../../services/api/api.hr-employee";

interface AttendanceFiltersProps {
  isAdmin: boolean;
  month: number;
  year: number;
  filterBranch: string;
  filterEmployee: string;
  branches: IBranch[];
  employees: IEmployee[];
  onMonthChange: (v: number) => void;
  onYearChange: (v: number) => void;
  onBranchChange: (v: string) => void;
  onEmployeeChange: (v: string) => void;
}

export const AttendanceFilters = ({
  isAdmin,
  month,
  year,
  filterBranch,
  filterEmployee,
  branches,
  employees,
  onMonthChange,
  onYearChange,
  onBranchChange,
  onEmployeeChange,
}: AttendanceFiltersProps) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-wrap gap-3 items-end">
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
      <select
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        value={month}
        onChange={(e) => onMonthChange(Number(e.target.value))}
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <option key={m} value={m}>Month {m}</option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
      <select
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        value={year}
        onChange={(e) => onYearChange(Number(e.target.value))}
      >
        {[2024, 2025, 2026, 2027].map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
    {isAdmin && (
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Branch</label>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
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
      <label className="block text-xs font-medium text-gray-600 mb-1">Employee</label>
      <select
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        value={filterEmployee}
        onChange={(e) => onEmployeeChange(e.target.value)}
      >
        <option value="">All</option>
        {employees.map((e) => (
          <option key={e._id} value={e._id}>{e.userName}</option>
        ))}
      </select>
    </div>
  </div>
);
