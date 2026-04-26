import { motion } from "framer-motion";
import type { IEmployee } from "../../../../services/api/api.hr-employee";
import { ROLE_LABELS, ROLE_COLORS } from "../constants";
import { formatDate, formatCurrency, getBranchName } from "../utils";

interface EmployeeTableProps {
  employees: IEmployee[];
  isLoading: boolean;
  onEdit: (emp: IEmployee) => void;
}

export const EmployeeTable = ({
  employees,
  isLoading,
  onEdit,
}: EmployeeTableProps) => {
  if (isLoading) {
    return (
      <div className="p-12 text-center text-gray-400">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-button2 border-t-transparent rounded-full animate-spin mb-4" />
          Loading...
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="p-12 text-center text-gray-400">No employees found.</div>
    );
  }

  return (
    <>
      {/* ── Mobile card list (< md) ── */}
      <div className="block md:hidden divide-y divide-gray-100">
        {employees.map((emp, index) => (
          <motion.div
            key={emp._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            className="p-4 space-y-2"
          >
            {/* Name + status */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-gray-800">{emp.userName}</span>
              <span
                className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${emp.isActive !== false ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${emp.isActive !== false ? "bg-green-500" : "bg-gray-400"}`}
                />
                {emp.isActive !== false ? "Active" : "Inactive"}
              </span>
            </div>
            {/* Email + phone */}
            <div className="text-sm text-gray-500">{emp.email}</div>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
              <span>{emp.phoneNumber}</span>
              <span>{getBranchName(emp.branchId)}</span>
            </div>
            {/* Role + salary + start */}
            <div className="flex flex-wrap gap-2 items-center">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[emp.role] ?? "bg-gray-100 text-gray-600"}`}
              >
                {ROLE_LABELS[emp.role] ?? emp.role}
              </span>
              <span className="text-xs text-gray-600 font-medium">
                {formatCurrency(emp.baseSalary)}
              </span>
              <span className="text-xs text-gray-400">
                From {formatDate(emp.startDate)}
              </span>
            </div>
            {/* Edit */}
            <div className="pt-1">
              <button
                onClick={() => onEdit(emp)}
                className="p-1.5 text-button2 hover:bg-red-50 rounded-lg transition-colors"
                title="Edit"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                </svg>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Desktop table (≥ md) ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {[
                "Full Name",
                "Email",
                "Phone",
                "Role",
                "Branch",
                "Base Salary",
                "Start Date",
                "Status",
              ].map((col) => (
                <th
                  key={col}
                  className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
              <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, index) => (
              <motion.tr
                key={emp._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors group"
              >
                <td className="p-5 font-medium text-gray-800">
                  {emp.userName}
                </td>
                <td className="p-5 text-gray-600">{emp.email}</td>
                <td className="p-5 text-gray-600">{emp.phoneNumber}</td>
                <td className="p-5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[emp.role] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {ROLE_LABELS[emp.role] ?? emp.role}
                  </span>
                </td>
                <td className="p-5 text-gray-600">
                  {getBranchName(emp.branchId)}
                </td>
                <td className="p-5 text-gray-600">
                  {formatCurrency(emp.baseSalary)}
                </td>
                <td className="p-5 text-gray-600">
                  {formatDate(emp.startDate)}
                </td>
                <td className="p-5">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${emp.isActive !== false ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${emp.isActive !== false ? "bg-green-500" : "bg-gray-400"}`}
                    />
                    {emp.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-5 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => onEdit(emp)}
                      className="p-2 text-button2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
