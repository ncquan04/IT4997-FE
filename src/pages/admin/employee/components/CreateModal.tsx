import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "../../../../contexts/ToastContext";
import {
  createEmployee,
  type ICreateEmployeePayload,
  type IEmployee,
} from "../../../../services/api/api.hr-employee";
import type { IBranch } from "../../../../shared/models/branch-model";
import { ROLE_LABELS } from "../constants";

interface CreateModalProps {
  branches: IBranch[];
  onClose: () => void;
  onCreated: (employee: IEmployee) => void;
}

const DEFAULT_FORM: ICreateEmployeePayload = {
  userName: "",
  email: "",
  phoneNumber: "",
  password: "",
  role: "SALES",
  branchId: "",
  baseSalary: 0,
  startDate: undefined,
};

export const CreateModal = ({
  branches,
  onClose,
  onCreated,
}: CreateModalProps) => {
  const { showToast } = useToast();
  const [form, setForm] = useState<ICreateEmployeePayload>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ICreateEmployeePayload>(
    key: K,
    value: ICreateEmployeePayload[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  const handleCreate = async () => {
    if (
      !form.userName.trim() ||
      !form.email.trim() ||
      !form.phoneNumber.trim() ||
      !form.password.trim()
    ) {
      showToast("Please fill in all required fields", "error");
      return;
    }
    setSaving(true);
    const result = await createEmployee({
      ...form,
      branchId: form.branchId || undefined,
      startDate: form.startDate || undefined,
    });
    setSaving(false);
    if (result) {
      showToast("Employee created successfully", "success");
      onCreated(result);
    } else {
      showToast(
        "Failed to create employee. Email may already be in use.",
        "error",
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-lg font-semibold mb-4">Add New Employee</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Full name"
              value={form.userName}
              onChange={(e) => set("userName", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Phone number"
              value={form.phoneNumber}
              onChange={(e) => set("phoneNumber", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Initial password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.role ?? "SALES"}
              onChange={(e) => set("role", e.target.value)}
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
              onChange={(e) => set("branchId", e.target.value)}
            >
              <option value="">-- Select branch --</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Salary (VND)
            </label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.baseSalary ?? 0}
              min={0}
              onChange={(e) => set("baseSalary", Number(e.target.value))}
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
                set(
                  "startDate",
                  e.target.value
                    ? new Date(e.target.value).getTime()
                    : undefined,
                )
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
            onClick={handleCreate}
            disabled={saving}
            className="px-4 py-2 text-sm rounded-lg bg-button2 text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
