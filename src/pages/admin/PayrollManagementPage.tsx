import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { UserRole } from "../../shared/models/user-model";
import { PayrollStatus } from "../../shared/models/payroll-model";
import type { IBranch } from "../../shared/models/branch-model";
import { fetchBranches } from "../../services/api/api.branches";
import {
  fetchPayrollList,
  generatePayroll,
  updatePayrollStatus,
  type IPayrollRecord,
} from "../../services/api/api.payroll";

const STATUS_META: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-600" },
  CONFIRMED: { label: "Confirmed", color: "bg-blue-100 text-blue-700" },
  PAID: { label: "Paid", color: "bg-green-100 text-green-700" },
};

const formatCurrency = (n: number) => n.toLocaleString("vi-VN") + " ₫";

const getEmployeeName = (emp: any) => {
  if (!emp) return "—";
  if (typeof emp === "object") return emp.userName ?? "—";
  return emp;
};

// ─── Generate Modal ───────────────────────────────────────────────────────────
interface GenerateModalProps {
  branches: IBranch[];
  isAdmin: boolean;
  currentBranchId: string;
  onClose: () => void;
  onGenerated: () => void;
}

const GenerateModal = ({
  branches,
  isAdmin,
  currentBranchId,
  onClose,
  onGenerated,
}: GenerateModalProps) => {
  const { showToast } = useToast();
  const now = new Date();
  const [form, setForm] = useState({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    branchId: currentBranchId,
    standardDays: 26,
    allowances: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!form.branchId) {
      showToast("Please select a branch", "error");
      return;
    }
    setLoading(true);
    const result = await generatePayroll({
      month: form.month,
      year: form.year,
      branchId: form.branchId || undefined,
      standardDays: form.standardDays,
      allowances: form.allowances,
    });
    setLoading(false);
    if (result.length > 0) {
      showToast(`Generated ${result.length} payroll record(s)`, "success");
      onGenerated();
    } else {
      showToast("No employees found or an error occurred", "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Generate Monthly Payroll</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Month
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.month}
                onChange={(e) =>
                  setForm((f) => ({ ...f, month: Number(e.target.value) }))
                }
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Month {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Year
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.year}
                onChange={(e) =>
                  setForm((f) => ({ ...f, year: Number(e.target.value) }))
                }
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {isAdmin && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Branch
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.branchId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, branchId: e.target.value }))
                }
              >
                <option value="">-- Select branch --</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Standard Working Days / Month
            </label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.standardDays}
              min={1}
              max={31}
              onChange={(e) =>
                setForm((f) => ({ ...f, standardDays: Number(e.target.value) }))
              }
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Allowances (VND)
            </label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.allowances}
              min={0}
              onChange={(e) =>
                setForm((f) => ({ ...f, allowances: Number(e.target.value) }))
              }
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-button2 text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Payroll"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const PayrollManagementPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === UserRole.ADMIN;

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [filterBranch, setFilterBranch] = useState("");

  const [branches, setBranches] = useState<IBranch[]>([]);
  const [records, setRecords] = useState<IPayrollRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [branchList, payrollList] = await Promise.all([
      isAdmin ? fetchBranches() : Promise.resolve([]),
      fetchPayrollList({ month, year, branchId: filterBranch || undefined }),
    ]);
    if (isAdmin) setBranches(branchList);
    setRecords(payrollList);
    setIsLoading(false);
  }, [isAdmin, month, year, filterBranch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (id: string, status: PayrollStatus) => {
    setUpdatingId(id);
    const result = await updatePayrollStatus(id, status);
    setUpdatingId(null);
    if (result) {
      setRecords((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: result.status } : r)),
      );
      showToast("Status updated successfully", "success");
    } else {
      showToast("Update failed", "error");
    }
  };

  // Tổng thực lĩnh
  const totalActual = records.reduce((sum, r) => sum + r.actualSalary, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Payroll Management
          </h1>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2 bg-button2 text-white rounded-lg text-sm hover:opacity-90 whitespace-nowrap"
          >
            + Generate Payroll
          </button>
        </div>

        {/* Bộ lọc */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Month
            </label>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  Month {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Year
            </label>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          {isAdmin && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Branch
              </label>
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
              >
                <option value="">All</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Tổng chi lương */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Total Employees
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {records.length}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Total Net Salary
              </div>
              <div className="text-2xl font-bold text-button2">
                {formatCurrency(totalActual)}
              </div>
            </div>
          </div>

        {/* Bảng lương */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500">Loading...</div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No payroll records. Click "Generate Payroll" to start.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Employee
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Working Days
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Leave Days
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Base Salary
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Allowances
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Deductions
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Net Salary
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-3"></th>
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
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {getEmployeeName(r.employeeId)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.workingDays}/{r.standardDays}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.leaveDays}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatCurrency(r.baseSalary)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatCurrency(r.allowances)}
                    </td>
                    <td className="px-4 py-3 text-red-500">
                      -{formatCurrency(r.deductions)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {formatCurrency(r.actualSalary)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_META[r.status]?.color}`}
                      >
                        {STATUS_META[r.status]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {r.status === PayrollStatus.DRAFT && (
                          <button
                            onClick={() =>
                              handleStatusChange(r._id, PayrollStatus.CONFIRMED)
                            }
                            disabled={updatingId === r._id}
                            title="Confirm payroll"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {/* check icon */}
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
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>
                        )}
                        {r.status === PayrollStatus.CONFIRMED && (
                          <button
                            onClick={() =>
                              handleStatusChange(r._id, PayrollStatus.PAID)
                            }
                            disabled={updatingId === r._id}
                            title="Mark as Paid"
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {/* circle-check icon */}
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
          )}
        </div>
      </div>

      <AnimatePresence>
        {showGenerateModal && (
          <GenerateModal
            branches={branches}
            isAdmin={isAdmin}
            currentBranchId={user?.branchId ?? ""}
            onClose={() => setShowGenerateModal(false)}
            onGenerated={() => {
              setShowGenerateModal(false);
              loadData();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PayrollManagementPage;
