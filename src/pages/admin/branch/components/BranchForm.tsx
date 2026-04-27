import { useState } from "react";
import type { IBranchPopulated } from "../../../../shared/models/branch-model";
import type {
  BranchFormData,
  RentHistoryPayload,
} from "../../../../services/api/api.branches";
import type { IEmployee } from "../../../../services/api/api.hr-employee";
import { EMPTY_FORM, INPUT_CLS, formatRentCost } from "../constants";

interface BranchFormProps {
  editingBranch: IBranchPopulated | null;
  managers: IEmployee[];
  onSubmit: (data: BranchFormData) => Promise<void>;
  onCancel: () => void;
  onAddRentHistory?: (data: RentHistoryPayload) => Promise<void>;
}

const EMPTY_HISTORY_FORM: RentHistoryPayload = {
  amount: 0,
  effectiveFrom: new Date().toISOString().split("T")[0],
  note: "",
};

const BranchForm = ({
  editingBranch,
  managers,
  onSubmit,
  onCancel,
  onAddRentHistory,
}: BranchFormProps) => {
  const [form, setForm] = useState<BranchFormData>(
    editingBranch
      ? {
          name: editingBranch.name,
          address: editingBranch.address,
          phone: editingBranch.phone,
          managerId: editingBranch.managerId?._id ?? "",
          isActive: editingBranch.isActive,
          rentCost: editingBranch.rentCost ?? 0,
        }
      : EMPTY_FORM,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistoryForm, setShowHistoryForm] = useState(false);
  const [historyForm, setHistoryForm] =
    useState<RentHistoryPayload>(EMPTY_HISTORY_FORM);
  const [isAddingHistory, setIsAddingHistory] = useState(false);

  const history = editingBranch?.rentCostHistory ?? [];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "rentCost"
            ? Number(value)
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(form);
    setIsSubmitting(false);
  };

  const handleHistoryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setHistoryForm((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }));
  };

  const handleAddHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddRentHistory) return;
    setIsAddingHistory(true);
    await onAddRentHistory(historyForm);
    setIsAddingHistory(false);
    setShowHistoryForm(false);
    setHistoryForm(EMPTY_HISTORY_FORM);
  };

  return (
    <div className="max-h-[85vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          {editingBranch ? "Edit Branch" : "Add New Branch"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Branch Name <span className="text-red-500">*</span>
            </label>
            <input
              className={INPUT_CLS}
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. Hanoi Branch"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              className={INPUT_CLS}
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              placeholder="e.g. 123 Nguyen Hue, District 1, HCM"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              className={INPUT_CLS}
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="e.g. 0901234567"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Branch Manager <span className="text-red-500">*</span>
            </label>
            <select
              className={INPUT_CLS}
              name="managerId"
              value={form.managerId}
              onChange={handleChange}
              required
            >
              <option value="">-- Select manager --</option>
              {managers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.userName} ({m.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Monthly Rent Cost (VNĐ)
            </label>
            <input
              className={INPUT_CLS}
              name="rentCost"
              type="number"
              min={0}
              value={form.rentCost}
              onChange={handleChange}
              placeholder="e.g. 50000000"
            />
          </div>

          <div className="flex items-center gap-2 mt-1">
            <input
              id="isActive"
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="w-4 h-4 accent-button2"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-gray-700"
            >
              Active
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-button2 hover:bg-hoverButton text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : editingBranch ? "Update" : "Create"}
          </button>
        </div>
      </form>

      {/* Rent Cost History — only when editing */}
      {editingBranch && (
        <div className="border-t border-gray-100 px-6 pb-6">
          <div className="flex items-center justify-between mt-5 mb-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Rent Cost History
            </h3>
            <button
              type="button"
              onClick={() => setShowHistoryForm((v) => !v)}
              className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors"
            >
              {showHistoryForm ? "Cancel" : "+ Add Entry"}
            </button>
          </div>

          {/* Add history form */}
          {showHistoryForm && (
            <form
              onSubmit={handleAddHistory}
              className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Amount (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={INPUT_CLS}
                    name="amount"
                    type="number"
                    min={0}
                    required
                    value={historyForm.amount}
                    onChange={handleHistoryChange}
                    placeholder="50000000"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Effective From <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={INPUT_CLS}
                    name="effectiveFrom"
                    type="date"
                    required
                    value={historyForm.effectiveFrom}
                    onChange={handleHistoryChange}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Note (optional)
                </label>
                <input
                  className={INPUT_CLS}
                  name="note"
                  value={historyForm.note ?? ""}
                  onChange={handleHistoryChange}
                  placeholder="e.g. Rent increased after contract renewal"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isAddingHistory}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {isAddingHistory ? "Saving..." : "Save Entry"}
                </button>
              </div>
            </form>
          )}

          {/* History table */}
          {history.length === 0 ? (
            <p className="text-xs text-gray-400 italic">
              No history recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase">
                  <tr>
                    <th className="text-left py-2 px-3">Effective From</th>
                    <th className="text-right py-2 px-3">Amount</th>
                    <th className="text-left py-2 px-3">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[...history]
                    .sort(
                      (a, b) =>
                        new Date(b.effectiveFrom).getTime() -
                        new Date(a.effectiveFrom).getTime(),
                    )
                    .map((entry, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="py-2 px-3 text-gray-700">
                          {new Date(entry.effectiveFrom).toLocaleDateString(
                            "vi-VN",
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-purple-700">
                          {formatRentCost(entry.amount)}
                        </td>
                        <td className="py-2 px-3 text-gray-400 italic">
                          {entry.note || "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BranchForm;
