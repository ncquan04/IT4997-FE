import { useState } from "react";
import type { IBranchPopulated } from "../../../../shared/models/branch-model";
import type { BranchFormData } from "../../../../services/api/api.branches";
import type { IEmployee } from "../../../../services/api/api.hr-employee";
import { EMPTY_FORM, INPUT_CLS } from "../constants";

interface BranchFormProps {
  editingBranch: IBranchPopulated | null;
  managers: IEmployee[];
  onSubmit: (data: BranchFormData) => Promise<void>;
  onCancel: () => void;
}

const BranchForm = ({
  editingBranch,
  managers,
  onSubmit,
  onCancel,
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
      : EMPTY_FORM
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

  return (
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
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
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
  );
};

export default BranchForm;
