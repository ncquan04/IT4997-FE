import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "../../../../contexts/ToastContext";
import { generatePayroll } from "../../../../services/api/api.payroll";
import type { IBranch } from "../../../../shared/models/branch-model";

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
              <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.month}
                onChange={(e) => setForm((f) => ({ ...f, month: Number(e.target.value) }))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>Month {m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          {isAdmin && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Branch</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.branchId}
                onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
              >
                <option value="">-- Select branch --</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
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
              onChange={(e) => setForm((f) => ({ ...f, standardDays: Number(e.target.value) }))}
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
              onChange={(e) => setForm((f) => ({ ...f, allowances: Number(e.target.value) }))}
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

export default GenerateModal;
