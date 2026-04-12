import { motion } from "framer-motion";
import { PayrollStatus } from "../../../../shared/models/payroll-model";
import type { IPayrollRecord } from "../../../../services/api/api.payroll";
import { STATUS_META, formatCurrency, getEmployeeName } from "../constants";

interface PayrollTableProps {
  records: IPayrollRecord[];
  isLoading: boolean;
  updatingId: string | null;
  bulkUpdating: boolean;
  onStatusChange: (id: string, status: PayrollStatus) => void;
  onBulkStatusChange: (from: PayrollStatus, to: PayrollStatus) => void;
}

const PayrollTable = ({
  records,
  isLoading,
  updatingId,
  bulkUpdating,
  onStatusChange,
  onBulkStatusChange,
}: PayrollTableProps) => {
  if (isLoading) {
    return <div className="p-12 text-center text-gray-500">Loading...</div>;
  }
  if (records.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500">
        No payroll records. Click "Generate Payroll" to start.
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50 border-b border-gray-100">
        <tr>
          <th className="text-left px-4 py-3 font-medium text-gray-600">Employee</th>
          <th className="text-left px-4 py-3 font-medium text-gray-600">Working Days</th>
          <th className="text-left px-4 py-3 font-medium text-gray-600">Leave Days</th>
          <th className="text-left px-4 py-3 font-medium text-gray-600">Base Salary</th>
          <th className="text-left px-4 py-3 font-medium text-gray-600">Allowances</th>
          <th className="text-left px-4 py-3 font-medium text-gray-600">Deductions</th>
          <th className="text-left px-4 py-3 font-semibold text-gray-600">Net Salary</th>
          <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
          <th className="px-4 py-3">
            <div className="flex gap-1 justify-end">
              {records.some((r) => r.status === PayrollStatus.DRAFT) && (
                <button
                  onClick={() => onBulkStatusChange(PayrollStatus.DRAFT, PayrollStatus.CONFIRMED)}
                  disabled={bulkUpdating}
                  className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {bulkUpdating ? "..." : "Accept All"}
                </button>
              )}
              {records.some((r) => r.status === PayrollStatus.CONFIRMED) && (
                <button
                  onClick={() => onBulkStatusChange(PayrollStatus.CONFIRMED, PayrollStatus.PAID)}
                  disabled={bulkUpdating}
                  className="px-2 py-1 text-green-600 hover:bg-green-50 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {bulkUpdating ? "..." : "Pay All"}
                </button>
              )}
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {records.map((r) => (
          <motion.tr
            key={r._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-b border-gray-100 hover:bg-gray-50 transition-colors group"
          >
            <td className="px-4 py-3 font-medium text-gray-800">{getEmployeeName(r.employeeId)}</td>
            <td className="px-4 py-3 text-gray-600">{r.workingDays}/{r.standardDays}</td>
            <td className="px-4 py-3 text-gray-600">{r.leaveDays}</td>
            <td className="px-4 py-3 text-gray-600">{formatCurrency(r.baseSalary)}</td>
            <td className="px-4 py-3 text-gray-600">{formatCurrency(r.allowances)}</td>
            <td className="px-4 py-3 text-red-500">-{formatCurrency(r.deductions)}</td>
            <td className="px-4 py-3 font-semibold text-gray-800">{formatCurrency(r.actualSalary)}</td>
            <td className="px-4 py-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_META[r.status]?.color}`}>
                {STATUS_META[r.status]?.label}
              </span>
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {r.status === PayrollStatus.DRAFT && (
                  <button
                    onClick={() => onStatusChange(r._id, PayrollStatus.CONFIRMED)}
                    disabled={updatingId === r._id}
                    title="Confirm payroll"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                )}
                {r.status === PayrollStatus.CONFIRMED && (
                  <button
                    onClick={() => onStatusChange(r._id, PayrollStatus.PAID)}
                    disabled={updatingId === r._id}
                    title="Mark as Paid"
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </button>
                )}
              </div>
            </td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  );
};

export default PayrollTable;
