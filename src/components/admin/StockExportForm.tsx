import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import type { IBranch } from "../../shared/models/branch-model";
import type {
  ICreateStockExportPayload,
  ExportReason,
} from "../../types/stock-export.types";
import { lookupImei } from "../../services/api/api.stock-export";
import { useStockExportItems } from "../../hooks/stock-export/useStockExportItems";

const EXPORT_REASONS: { value: ExportReason; label: string }[] = [
  { value: "SALE", label: "Bán tại quầy" },
  { value: "RETURN_TO_SUPPLIER", label: "Return to Supplier" },
  { value: "DAMAGED", label: "Damaged / Defective" },
  { value: "OTHER", label: "Other" },
];

interface StockExportFormProps {
  branches: IBranch[];
  onSubmit: (payload: ICreateStockExportPayload) => Promise<boolean>;
  onCancel: () => void;
}

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "loading")
    return (
      <svg
        className="animate-spin w-4 h-4 text-gray-400"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8z"
        />
      </svg>
    );
  if (status === "found")
    return <span className="text-green-500 text-sm font-bold">✓</span>;
  if (status === "error")
    return <span className="text-red-500 text-sm font-bold">✗</span>;
  return null;
};

const StockExportForm = ({
  branches,
  onSubmit,
  onCancel,
}: StockExportFormProps) => {
  const { user } = useAuth();
  const [branchId, setBranchId] = useState(user?.branchId ?? "");
  const [reason, setReason] = useState<ExportReason>("OTHER");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isBranchLocked = Boolean(user?.branchId);

  // keep ref in sync so the stable lookup callback always reads the latest branchId
  const branchIdRef = useRef(branchId);
  useEffect(() => {
    branchIdRef.current = branchId;
  }, [branchId]);

  // sync when user loads asynchronously
  useEffect(() => {
    if (user?.branchId) setBranchId(user.branchId);
  }, [user?.branchId]);

  // stable lookup that always uses the current branchId via ref
  const handleLookupImei = useCallback(
    (imei: string) => lookupImei(branchIdRef.current, imei),
    [],
  );

  const {
    entries,
    addEntry,
    removeEntry,
    handleImeiChange,
    getGroups,
    buildItems,
  } = useStockExportItems({ onLookupImei: handleLookupImei });

  const groups = getGroups();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!branchId) {
      alert("Branch is required");
      return;
    }
    const items = buildItems();
    if (items.length === 0) {
      alert("At least one valid IMEI is required");
      return;
    }
    setIsSaving(true);
    try {
      const ok = await onSubmit({ branchId, reason, note: note.trim(), items });
      if (ok) onCancel();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Create Stock Export
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Enter each product's IMEI to record a manual stock-out
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <form
          id="stock-export-form"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Info Section */}
          <section className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Export Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Branch
                </label>
                {isBranchLocked ? (
                  <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 text-sm">
                    {branches.find((b) => b._id === branchId)?.name ?? branchId}
                  </div>
                ) : (
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
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Export Reason
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as ExportReason)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-button2 focus:border-button2 transition-all outline-none bg-white"
                >
                  {EXPORT_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Note (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Add a note..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-button2 focus:border-button2 transition-all outline-none resize-none"
                />
              </div>
            </div>
          </section>

          {/* IMEI Input Section */}
          <section className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Enter Product IMEIs
              </h3>
              <button
                type="button"
                onClick={addEntry}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 font-medium text-sm"
              >
                + Add IMEI
              </button>
            </div>

            <div className="space-y-2">
              {entries.map((entry) => (
                <div key={entry.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={entry.imei}
                        onChange={(e) =>
                          handleImeiChange(entry.id, e.target.value)
                        }
                        placeholder="Enter IMEI..."
                        className={`w-full px-3 py-2 pr-9 border rounded-lg focus:ring-2 outline-none transition-all text-sm ${
                          entry.status === "found"
                            ? "border-green-400 focus:ring-green-200"
                            : entry.status === "error"
                              ? "border-red-400 focus:ring-red-200"
                              : "border-gray-300 focus:ring-button2"
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <StatusIcon status={entry.status} />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEntry(entry.id)}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-colors text-sm"
                    >
                      -
                    </button>
                  </div>

                  {entry.status === "found" && entry.result && (
                    <div className="ml-1 text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">
                      <span className="font-semibold">
                        {entry.result.product.title}
                      </span>
                      {" · "}
                      <span>{entry.result.variant.variantName}</span>
                      {entry.result.variant.sku && (
                        <span className="text-green-500">
                          {" "}
                          ({entry.result.variant.sku})
                        </span>
                      )}
                    </div>
                  )}
                  {entry.status === "error" && (
                    <div className="ml-1 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5">
                      {entry.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Grouped Summary */}
          {groups.length > 0 && (
            <section className="bg-blue-50 rounded-xl border border-blue-100 p-5">
              <h3 className="text-base font-semibold text-blue-800 mb-3">
                Product Summary
              </h3>
              <div className="space-y-2">
                {groups.map((g) => (
                  <div
                    key={`${g.productId}-${g.variantId}`}
                    className="flex items-center justify-between bg-white border border-blue-100 rounded-lg px-4 py-2.5"
                  >
                    <div>
                      <div className="text-sm font-semibold text-gray-800">
                        {g.productTitle}
                      </div>
                      <div className="text-xs text-gray-500">
                        {g.variantName}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Qty:</span>
                      <span className="text-sm font-bold text-blue-600">
                        {g.imeis.length}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </form>
      </div>

      {/* Footer */}
      <div className="shrink-0 p-6 border-t border-gray-100 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="stock-export-form"
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-button2 hover:bg-hoverButton text-white font-semibold shadow-md disabled:opacity-70 disabled:cursor-not-allowed transition-all"
        >
          {isSaving ? "Saving..." : "Create Export"}
        </button>
      </div>
    </motion.div>
  );
};

export default StockExportForm;
