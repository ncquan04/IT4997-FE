import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../../../contexts/AuthContext";
import { useToast } from "../../../../contexts/ToastContext";
import { UserRole } from "../../../../shared/models/user-model";
import type { IBranch } from "../../../../shared/models/branch-model";
import type {
  ICreateStockTransferItemPayload,
  ICreateStockTransferPayload,
} from "../../../../types/stock-transfer.types";
import type { IInventoryItem } from "../../../../types/inventory.types";
import { fetchInventoryList } from "../../../../services/api/api.inventory";

interface CreateStockTransferModalProps {
  branches: IBranch[];
  onSubmit: (payload: ICreateStockTransferPayload) => Promise<boolean>;
  onCancel: () => void;
}

const CreateStockTransferModal = ({
  branches,
  onSubmit,
  onCancel,
}: CreateStockTransferModalProps) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isFromBranchLocked =
    Boolean(user?.branchId) && user?.role !== UserRole.ADMIN;

  const [fromBranchId, setFromBranchId] = useState(
    isFromBranchLocked ? (user?.branchId ?? "") : "",
  );
  const [toBranchId, setToBranchId] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<ICreateStockTransferItemPayload[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [inventoryList, setInventoryList] = useState<IInventoryItem[]>([]);
  const [selectedInventoryId, setSelectedInventoryId] = useState("");
  const [imeiInput, setImeiInput] = useState("");

  // Keep locked fromBranchId in sync with the logged-in user.
  useEffect(() => {
    if (isFromBranchLocked && user?.branchId) {
      setFromBranchId(user.branchId);
    }
  }, [isFromBranchLocked, user?.branchId]);

  // Load inventory for the selected source branch.
  useEffect(() => {
    if (!fromBranchId) {
      setInventoryList([]);
      return;
    }
    fetchInventoryList({ branchId: fromBranchId, limit: 1000 }).then((res) => {
      setInventoryList(res?.items ?? []);
    });
    setItems([]);
    setSelectedInventoryId("");
    setImeiInput("");
  }, [fromBranchId]);

  const handleAddItem = () => {
    if (!selectedInventoryId) {
      showToast("Select a product to add", "error");
      return;
    }

    // Parse + dedupe IMEIs (preserve order)
    const seen = new Set<string>();
    const imeis: string[] = [];
    for (const raw of imeiInput.split(/[,\n]/)) {
      const v = raw.trim();
      if (!v || seen.has(v)) continue;
      seen.add(v);
      imeis.push(v);
    }

    if (imeis.length === 0) {
      showToast("Please input at least one IMEI", "error");
      return;
    }

    const invLine = inventoryList.find((i) => i._id === selectedInventoryId);
    if (!invLine) return;

    // Don't allow IMEIs already queued elsewhere in this draft.
    const alreadyQueued = new Set(items.flatMap((it) => it.imeiList));
    const duplicates = imeis.filter((imei) => alreadyQueued.has(imei));
    if (duplicates.length > 0) {
      showToast(`Already in this transfer: ${duplicates.join(", ")}`, "error");
      return;
    }

    // Check IMEI is actually in this branch's stock.
    const availableSet = new Set(invLine.imeiList ?? []);
    const missing = imeis.filter((imei) => !availableSet.has(imei));
    if (missing.length > 0) {
      showToast(`IMEIs not found in source branch: ${missing.join(", ")}`, "error");
      return;
    }

    setItems([
      ...items,
      {
        productId: invLine.productId,
        variantId: invLine.variantId,
        imeiList: imeis,
      },
    ]);
    setSelectedInventoryId("");
    setImeiInput("");
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fromBranchId || !toBranchId) {
      showToast("Please select both branches", "error");
      return;
    }
    if (fromBranchId === toBranchId) {
      showToast("Source and target must be different", "error");
      return;
    }
    if (items.length === 0) {
      showToast("Please add at least one item", "error");
      return;
    }

    setIsSaving(true);
    const ok = await onSubmit({
      fromBranchId,
      toBranchId,
      note: note.trim(),
      items,
    });
    setIsSaving(false);
    if (ok) onCancel();
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Create Stock Transfer</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Move IMEIs from one branch to another
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <form id="stock-transfer-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Header inputs */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                From Branch
              </label>
              {isFromBranchLocked ? (
                <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 text-sm">
                  {branches.find((b) => b._id === fromBranchId)?.name ?? fromBranchId}
                </div>
              ) : (
                <select
                  value={fromBranchId}
                  onChange={(e) => setFromBranchId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                >
                  <option value="">Select source branch</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                To Branch
              </label>
              <select
                value={toBranchId}
                onChange={(e) => setToBranchId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none bg-white"
              >
                <option value="">Select target branch</option>
                {branches.map((b) => (
                  <option
                    key={b._id}
                    value={b._id}
                    disabled={b._id === fromBranchId}
                  >
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Note (optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                placeholder="e.g. Restock request"
              />
            </div>
          </section>

          {/* Item picker */}
          <section className="bg-gray-50 rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Add items</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-5">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Product in stock
                </label>
                <select
                  disabled={!fromBranchId}
                  value={selectedInventoryId}
                  onChange={(e) => setSelectedInventoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none bg-white disabled:bg-gray-100"
                >
                  <option value="">Select product</option>
                  {inventoryList.map((inv) => (
                    <option key={inv._id} value={inv._id}>
                      {inv.product?.title ?? "—"} -{" "}
                      {inv.variant?.variantName ?? "—"} (Stock: {inv.quantity})
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-5">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  IMEIs (comma / newline)
                </label>
                <input
                  type="text"
                  disabled={!selectedInventoryId}
                  value={imeiInput}
                  onChange={(e) => setImeiInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none disabled:bg-gray-100"
                  placeholder="Paste IMEIs here"
                />
              </div>
              <div className="md:col-span-2 flex md:items-end">
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!selectedInventoryId || !imeiInput}
                  className="w-full px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          </section>

          {/* Queued items */}
          {items.length > 0 && (
            <section className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase">
                      Product
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase text-center">
                      Qty
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase">
                      IMEIs
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, index) => {
                    const invLine = inventoryList.find(
                      (inv) =>
                        inv.productId === item.productId &&
                        inv.variantId === item.variantId,
                    );
                    return (
                      <tr key={index}>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {invLine?.product?.title ?? item.productId} -{" "}
                          {invLine?.variant?.variantName ?? ""}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.imeiList.length}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1 max-w-[260px]">
                            {item.imeiList.map((imei) => (
                              <span
                                key={imei}
                                className="font-mono text-xs bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 text-gray-600"
                              >
                                {imei}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          )}
        </form>
      </div>

      <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50 shrink-0">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 rounded-xl font-semibold text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="stock-transfer-form"
          disabled={isSaving || items.length === 0}
          className="px-5 py-2 rounded-xl font-semibold text-sm bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
        >
          {isSaving ? "Creating..." : "Create Transfer"}
        </button>
      </div>
    </motion.div>
  );
};

export default CreateStockTransferModal;
