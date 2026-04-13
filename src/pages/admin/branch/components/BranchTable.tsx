import { motion } from "framer-motion";
import type { IBranchPopulated } from "../../../../shared/models/branch-model";
import { formatRentCost } from "../constants";

interface BranchTableProps {
  branches: IBranchPopulated[];
  isLoading: boolean;
  isAdmin: boolean;
  onEdit: (branch: IBranchPopulated) => void;
  onDelete: (branch: IBranchPopulated) => void;
}

const COLUMNS = ["#", "Branch Name", "Address", "Phone", "Manager", "Rent Cost", "Status"];

const BranchTable = ({
  branches,
  isLoading,
  isAdmin,
  onEdit,
  onDelete,
}: BranchTableProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-500">
        <div className="w-12 h-12 border-4 border-button2 border-t-transparent rounded-full animate-spin mb-4" />
        Loading branches...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {COLUMNS.map((col) => (
              <th
                key={col}
                className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
            {isAdmin && (
              <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider text-right">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {branches.length === 0 ? (
            <tr>
              <td colSpan={isAdmin ? 8 : 7} className="p-12 text-center text-gray-400">
                <div className="flex flex-col items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mb-4 text-gray-300"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <p>No branches found.</p>
                </div>
              </td>
            </tr>
          ) : (
            branches.map((branch, index) => (
              <motion.tr
                key={branch._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors group"
              >
                <td className="p-5 text-gray-500 text-sm">{index + 1}</td>
                <td className="p-5 font-semibold text-gray-900">{branch.name}</td>
                <td className="p-5 text-gray-600 max-w-xs truncate">{branch.address}</td>
                <td className="p-5 text-gray-600">{branch.phone}</td>
                <td className="p-5 text-gray-700">
                  {branch.managerId?.userName ?? (
                    <span className="text-gray-400 italic">Unassigned</span>
                  )}
                </td>
                <td className="p-5 font-medium text-gray-800">
                  {formatRentCost(branch.rentCost)}
                </td>
                <td className="p-5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      branch.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {branch.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                {isAdmin && (
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(branch)}
                        className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
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
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(branch)}
                        className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                        title="Delete"
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
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                )}
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BranchTable;
