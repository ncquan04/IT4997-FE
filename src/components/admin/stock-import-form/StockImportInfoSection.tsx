import type { IBranch } from "../../../shared/models/branch-model";
import type { ISupplier } from "../../../shared/models/supplier-model";

interface StockImportInfoSectionProps {
  branches: IBranch[];
  suppliers: ISupplier[];
  branchId: string;
  supplierId: string;
  note: string;
  setBranchId: (value: string) => void;
  setSupplierId: (value: string) => void;
  setNote: (value: string) => void;
}

const StockImportInfoSection = ({
  branches,
  suppliers,
  branchId,
  supplierId,
  note,
  setBranchId,
  setSupplierId,
  setNote,
}: StockImportInfoSectionProps) => {
  return (
    <section className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Import Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Branch
          </label>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-button2 focus:border-button2 transition-all outline-none bg-white"
          >
            <option value="">Select branch</option>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Supplier
          </label>
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-button2 focus:border-button2 transition-all outline-none bg-white"
          >
            <option value="">Select supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier._id} value={supplier._id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Note
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-button2 focus:border-button2 transition-all outline-none bg-white"
          placeholder="Optional note"
        />
      </div>
    </section>
  );
};

export default StockImportInfoSection;
