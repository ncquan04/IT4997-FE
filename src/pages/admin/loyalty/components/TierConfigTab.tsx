import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "../../../../contexts/ToastContext";
import {
  getTierConfigs,
  updateTierConfig,
  type ITierConfig,
} from "../../../../services/api/api.loyalty";
import { TIER_LABELS, TIER_COLORS } from "../constants";

interface TierEditState {
  minSpent: string;
  discountPercent: string;
  isActive: boolean;
}

const TierConfigTab = () => {
  const { showToast } = useToast();
  const [tiers, setTiers] = useState<ITierConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<TierEditState>({
    minSpent: "",
    discountPercent: "",
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const loadTiers = async () => {
    setIsLoading(true);
    const data = await getTierConfigs();
    setTiers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadTiers();
  }, []);

  const openEdit = (tier: ITierConfig) => {
    setEditingTier(tier.tier);
    setEditForm({
      minSpent: String(tier.minSpent),
      discountPercent: String(tier.discountPercent),
      isActive: tier.isActive,
    });
  };

  const cancelEdit = () => setEditingTier(null);

  const handleSave = async (tier: string) => {
    const minSpent = parseFloat(editForm.minSpent);
    const discountPercent = parseFloat(editForm.discountPercent);
    if (isNaN(minSpent) || minSpent < 0) {
      showToast("Minimum spend must be a non-negative number", "error");
      return;
    }
    if (
      isNaN(discountPercent) ||
      discountPercent < 0 ||
      discountPercent > 100
    ) {
      showToast("Discount must be between 0 and 100", "error");
      return;
    }
    setIsSaving(true);
    const updated = await updateTierConfig(tier, {
      minSpent,
      discountPercent,
      isActive: editForm.isActive,
    });
    setIsSaving(false);
    if (updated) {
      showToast("Tier updated successfully", "success");
      setEditingTier(null);
      setTiers((prev) =>
        prev.map((t) =>
          t.tier === tier
            ? { ...t, minSpent, discountPercent, isActive: editForm.isActive }
            : t,
        ),
      );
    } else {
      showToast("Failed to update tier", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-button2" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Mobile cards (< md) */}
      <div className="block md:hidden divide-y divide-gray-100">
        {tiers.map((tier) =>
          editingTier === tier.tier ? (
            <div key={tier.tier} className="p-4 space-y-3 bg-blue-50/40">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${TIER_COLORS[tier.tier]}`}
                >
                  {TIER_LABELS[tier.tier] ?? tier.tier}
                </span>
                <span className="text-xs text-gray-500 italic">Editing…</span>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Min. Spend (VND)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editForm.minSpent}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, minSpent: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-button2/30"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={editForm.discountPercent}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        discountPercent: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-button2/30"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, isActive: e.target.checked }))
                    }
                    className="w-4 h-4 accent-button2"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSave(tier.tier)}
                  disabled={isSaving}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-button2 hover:bg-hoverButton text-white text-xs font-medium transition disabled:opacity-60"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Save
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={cancelEdit}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Cancel
                </motion.button>
              </div>
            </div>
          ) : (
            <div key={tier.tier} className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${TIER_COLORS[tier.tier]}`}
                >
                  {TIER_LABELS[tier.tier] ?? tier.tier}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tier.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                  >
                    {tier.isActive ? "Active" : "Inactive"}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openEdit(tier)}
                    className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </motion.button>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-gray-700">
                <span>
                  Min spend:{" "}
                  <strong>{tier.minSpent.toLocaleString("vi-VN")} ₫</strong>
                </span>
                <span>
                  Discount: <strong>{tier.discountPercent}%</strong>
                </span>
              </div>
            </div>
          ),
        )}
      </div>

      {/* Desktop table (≥ md) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-3 text-left font-semibold text-gray-600">
                Tier
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-600">
                Min. Spend (VND)
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-600">
                Discount (%)
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-600">
                Status
              </th>
              <th className="px-6 py-3 text-right font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier) =>
              editingTier === tier.tier ? (
                <tr
                  key={tier.tier}
                  className="border-b border-gray-100 bg-blue-50/40"
                >
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${TIER_COLORS[tier.tier]}`}
                    >
                      {TIER_LABELS[tier.tier] ?? tier.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      min={0}
                      value={editForm.minSpent}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, minSpent: e.target.value }))
                      }
                      className="w-36 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-button2/30"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={editForm.discountPercent}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          discountPercent: e.target.value,
                        }))
                      }
                      className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-button2/30"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editForm.isActive}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            isActive: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 accent-button2"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSave(tier.tier)}
                        disabled={isSaving}
                        title="Save"
                        className="p-2 rounded-lg bg-button2 hover:bg-hoverButton text-white transition disabled:opacity-60"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={cancelEdit}
                        title="Cancel"
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr
                  key={tier.tier}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${TIER_COLORS[tier.tier]}`}
                    >
                      {TIER_LABELS[tier.tier] ?? tier.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-800 font-medium">
                    {tier.minSpent.toLocaleString("vi-VN")} ₫
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    {tier.discountPercent}%
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        tier.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {tier.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openEdit(tier)}
                      title="Edit"
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </motion.button>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TierConfigTab;
