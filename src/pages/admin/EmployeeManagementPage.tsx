import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { UserRole } from "../../shared/models/user-model";
import type { IBranch } from "../../shared/models/branch-model";
import { fetchBranches } from "../../services/api/api.branches";
import {
  fetchEmployees,
  updateEmployee,
  type IEmployee,
  type IUpdateEmployeePayload,
} from "../../services/api/api.hr-employee";

const ROLE_LABELS: Record<string, string> = {
  MANAGER: "Manager",
  WAREHOUSE: "Warehouse",
  SALES: "Sales",
  TECHNICIAN: "Technician",
};

const ROLE_COLORS: Record<string, string> = {
  MANAGER: "bg-purple-100 text-purple-700",
  WAREHOUSE: "bg-amber-100 text-amber-700",
  SALES: "bg-blue-100 text-blue-700",
  TECHNICIAN: "bg-green-100 text-green-700",
};

const formatDate = (ts?: number) => {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-GB");
};

const formatCurrency = (n?: number) => {
  if (n === undefined || n === null) return "—";
  return n.toLocaleString("vi-VN") + " ₫";
};

const getBranchName = (branchId: any): string => {
  if (!branchId) return "—";
  if (typeof branchId === "object") return branchId.name ?? "—";
  return branchId;
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────
interface EditModalProps {
  employee: IEmployee;
  branches: IBranch[];
  isAdmin: boolean;
  onClose: () => void;
  onSaved: (updated: IEmployee) => void;
}

const EditModal = ({
  employee,
  branches,
  isAdmin,
  onClose,
  onSaved,
}: EditModalProps) => {
  const { showToast } = useToast();
  const [form, setForm] = useState<IUpdateEmployeePayload>({
    userName: employee.userName,
    phoneNumber: employee.phoneNumber,
    baseSalary: employee.baseSalary ?? 0,
    startDate: employee.startDate,
    isActive: employee.isActive ?? true,
    role: employee.role,
    branchId:
      typeof employee.branchId === "object"
        ? (employee.branchId as any)?._id
        : employee.branchId,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateEmployee(employee._id, form);
    setSaving(false);
    if (result) {
      showToast("Updated successfully", "success");
      onSaved(result);
    } else {
      showToast("Update failed", "error");
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
        <h3 className="text-lg font-semibold mb-4">Edit Employee</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.userName ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, userName: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.phoneNumber ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, phoneNumber: e.target.value }))
              }
            />
          </div>
          {isAdmin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={form.role ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value }))
                  }
                >
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch
                </label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={form.branchId ?? ""}
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
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Salary (VND)
            </label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.baseSalary ?? 0}
              min={0}
              onChange={(e) =>
                setForm((f) => ({ ...f, baseSalary: Number(e.target.value) }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={
                form.startDate
                  ? new Date(form.startDate).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  startDate: e.target.value
                    ? new Date(e.target.value).getTime()
                    : undefined,
                }))
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive ?? true}
              onChange={(e) =>
                setForm((f) => ({ ...f, isActive: e.target.checked }))
              }
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Currently employed
            </label>
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
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm rounded-lg bg-button2 text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const EmployeeManagementPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filterBranch, setFilterBranch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterActive, setFilterActive] = useState<"" | "true" | "false">("");
  const [search, setSearch] = useState("");

  const [editingEmployee, setEditingEmployee] = useState<IEmployee | null>(
    null,
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [empList, branchList] = await Promise.all([
      fetchEmployees({
        branchId: filterBranch || undefined,
        role: filterRole || undefined,
        isActive: filterActive !== "" ? filterActive === "true" : undefined,
        search: search || undefined,
      }),
      isAdmin ? fetchBranches() : Promise.resolve([]),
    ]);
    setEmployees(empList);
    if (isAdmin) setBranches(branchList);
    setIsLoading(false);
  }, [filterBranch, filterRole, filterActive, search, isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaved = (updated: IEmployee) => {
    setEmployees((prev) =>
      prev.map((e) => (e._id === updated._id ? updated : e)),
    );
    setEditingEmployee(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Employee Management
        </h1>

        {/* Bộ lọc */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Search
            </label>
            <input
              className="border rounded-lg px-3 py-2 text-sm w-56"
              placeholder="Name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {isAdmin && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Branch
              </label>
              <select
                className="border rounded-lg px-3 py-2 text-sm"
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
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Role
            </label>
            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">All</option>
              {Object.entries(ROLE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Status
            </label>
            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value as any)}
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* Bảng nhân viên */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500">Loading...</div>
          ) : employees.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No employees found.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Full Name
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Phone
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Branch
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Base Salary
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Start Date
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Status
                  </th>
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
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {emp.userName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{emp.email}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {emp.phoneNumber}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[emp.role] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {ROLE_LABELS[emp.role] ?? emp.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {getBranchName(emp.branchId)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatCurrency(emp.baseSalary)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(emp.startDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${emp.isActive !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                      >
                        {emp.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setEditingEmployee(emp)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Edit
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AnimatePresence>
        {editingEmployee && (
          <EditModal
            employee={editingEmployee}
            branches={branches}
            isAdmin={isAdmin}
            onClose={() => setEditingEmployee(null)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeManagementPage;
