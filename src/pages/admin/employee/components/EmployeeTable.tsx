import { motion } from "framer-motion";
import type { IEmployee } from "../../../../services/api/api.hr-employee";
import { ROLE_LABELS, ROLE_COLORS } from "../constants";
import { formatDate, formatCurrency, getBranchName } from "../utils";

interface EmployeeTableProps {
  employees: IEmployee[];
  isLoading: boolean;
  onEdit: (emp: IEmployee) => void;
}

export const EmployeeTable = ({ employees, isLoading, onEdit }: EmployeeTableProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-gray-500">
        No employees found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Full Name</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Branch</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Base Salary</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Start Date</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <motion.tr
              key={emp._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-b hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3 font-medium text-gray-800">{emp.userName}</td>
              <td className="px-4 py-3 text-gray-600">{emp.email}</td>
              <td className="px-4 py-3 text-gray-600">{emp.phoneNumber}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[emp.role] ?? "bg-gray-100 text-gray-600"}`}>
                  {ROLE_LABELS[emp.role] ?? emp.role}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600">{getBranchName(emp.branchId)}</td>
              <td className="px-4 py-3 text-gray-600">{formatCurrency(emp.baseSalary)}</td>
              <td className="px-4 py-3 text-gray-600">{formatDate(emp.startDate)}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${emp.isActive !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {emp.isActive !== false ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onEdit(emp)}
                  className="text-blue-600 hover:underline text-xs"
                >
                  Edit
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
