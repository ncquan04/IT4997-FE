import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../contexts/ToastContext";
import {
  getTierConfigs,
  updateTierConfig,
  getAdminMemberList,
  type ITierConfig,
  type IAdminMember,
} from "../../services/api/api.loyalty";

const TIER_LABELS: Record<string, string> = {
  S_NEW: "S-New",
  S_MEM: "S-Mem",
  S_CLASS: "S-Class",
};

const TIER_COLORS: Record<string, string> = {
  S_NEW: "bg-gray-100 text-gray-700",
  S_MEM: "bg-blue-100 text-blue-700",
  S_CLASS: "bg-yellow-100 text-yellow-700",
};

// ─── Tier Config Tab ──────────────────────────────────────────────────────────

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

  const cancelEdit = () => {
    setEditingTier(null);
  };

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
                    {/* Save */}
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
                    {/* Cancel */}
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
  );
};

// ─── Members Tab ──────────────────────────────────────────────────────────────

const MembersTab = () => {
  const [members, setMembers] = useState<IAdminMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tierFilter, setTierFilter] = useState<string>("");

  const loadMembers = async (p: number, tier: string) => {
    setIsLoading(true);
    const result = await getAdminMemberList(p, 20, tier || undefined);
    if (result) {
      setMembers(result.data);
      setTotalPages(result.totalPages);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setPage(1);
    loadMembers(1, tierFilter);
  }, [tierFilter]);

  useEffect(() => {
    loadMembers(page, tierFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div>
      {/* Filter */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm font-medium text-gray-600">
          Filter by tier:
        </label>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-button2/30 bg-white"
        >
          <option value="">All</option>
          <option value="S_NEW">S-New</option>
          <option value="S_MEM">S-Mem</option>
          <option value="S_CLASS">S-Class</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-button2" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Name
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Email
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Tier
                </th>
                <th className="px-6 py-3 text-right font-semibold text-gray-600">
                  Points
                </th>
                <th className="px-6 py-3 text-right font-semibold text-gray-600">
                  Total Spend
                </th>
                <th className="px-6 py-3 text-right font-semibold text-gray-600">
                  Current Window Spend
                </th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No members found
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr
                    key={m._id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-3 font-medium text-gray-800">
                      {m.userName}
                    </td>
                    <td className="px-6 py-3 text-gray-500">{m.email}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TIER_COLORS[m.memberTier]}`}
                      >
                        {TIER_LABELS[m.memberTier] ?? m.memberTier}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right text-gray-800">
                      {(m.loyaltyPoints ?? 0).toLocaleString("vi-VN")} pt
                    </td>
                    <td className="px-6 py-3 text-right text-gray-800">
                      {(m.totalSpent ?? 0).toLocaleString("vi-VN")} ₫
                    </td>
                    <td className="px-6 py-3 text-right text-gray-800">
                      {(m.spentInWindow ?? 0).toLocaleString("vi-VN")} ₫
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

type TabKey = "tiers" | "members";

const LoyaltyManagementPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("tiers");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "tiers", label: "Tier Configuration" },
    { key: "members", label: "Member List" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Loyalty & Membership
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Configure membership tiers, discount rates, and reward points.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
          {tabs.map((tab) => (
            <motion.button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              whileTap={{ scale: 0.97 }}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "tiers" ? <TierConfigTab /> : <MembersTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoyaltyManagementPage;
