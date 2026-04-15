import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "../../../../contexts/ToastContext";
import {
  updateEmployee,
  type IEmployee,
  type IUpdateEmployeePayload,
} from "../../../../services/api/api.hr-employee";
import type { IBranch } from "../../../../shared/models/branch-model";
import { ROLE_LABELS } from "../constants";

interface EditModalProps {
  employee: IEmployee;
  branches: IBranch[];
  isAdmin: boolean;
  onClose: () => void;
  onSaved: (updated: IEmployee) => void;
}

export const EditModal = ({
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
    dependants: (employee as any).dependants ?? 0,
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
              Người phụ thuộc (giảm trừ thuế TNCN)
            </label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.dependants ?? 0}
              min={0}
              max={20}
              onChange={(e) =>
                setForm((f) => ({ ...f, dependants: Number(e.target.value) }))
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
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Currently employed
            </span>
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({ ...f, isActive: !(f.isActive ?? true) }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                (form.isActive ?? true) ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  (form.isActive ?? true) ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
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
