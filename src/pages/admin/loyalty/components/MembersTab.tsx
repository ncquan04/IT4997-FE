import { useState, useEffect } from "react";
import {
  getAdminMemberList,
  type IAdminMember,
} from "../../../../services/api/api.loyalty";
import { TIER_LABELS, TIER_COLORS } from "../constants";

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
        ) : members.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            No members found
          </div>
        ) : (
          <>
            {/* Mobile cards (< md) */}
            <div className="block md:hidden divide-y divide-gray-100">
              {members.map((m: IAdminMember) => (
                <div key={m._id} className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-gray-800">
                      {m.userName}
                    </span>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${TIER_COLORS[m.memberTier]}`}
                    >
                      {TIER_LABELS[m.memberTier] ?? m.memberTier}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">{m.email}</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-600">
                    <span>
                      Points:{" "}
                      <strong>
                        {(m.loyaltyPoints ?? 0).toLocaleString("vi-VN")} pt
                      </strong>
                    </span>
                    <span>
                      Total:{" "}
                      <strong>
                        {(m.totalSpent ?? 0).toLocaleString("vi-VN")} ₫
                      </strong>
                    </span>
                    <span>
                      Window:{" "}
                      <strong>
                        {(m.spentInWindow ?? 0).toLocaleString("vi-VN")} ₫
                      </strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table (≥ md) */}
            <div className="hidden md:block overflow-x-auto">
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
                  {members.map((m: IAdminMember) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </>
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

export default MembersTab;
