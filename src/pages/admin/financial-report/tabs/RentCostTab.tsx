import { useEffect, useState } from "react";
import { financialReportApi } from "../../../../services/api/api.financial-report";
import type {
  RentCostSummary,
  RentCostBranchItem,
} from "../../../../services/api/api.financial-report";
import { useAuth } from "../../../../contexts/AuthContext";
import { UserRole } from "../../../../shared/models/user-model";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { StatCard } from "../components/StatCard";
import { fmt } from "../utils";

interface RentCostData {
  summary: RentCostSummary;
  byBranch: RentCostBranchItem[];
}

export const RentCostTab = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  const [data, setData] = useState<RentCostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    financialReportApi
      .getRentCost()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      {loading ? (
        <LoadingSpinner />
      ) : !data ? null : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              label="Total Monthly Rent"
              value={fmt(data.summary.totalRentCost)}
              color="purple"
            />
            <StatCard
              label="Active Branches Rent"
              value={fmt(data.summary.totalActiveRentCost)}
              color="blue"
            />
            <StatCard
              label="Total Branches"
              value={String(data.summary.branchCount)}
              color="yellow"
            />
            <StatCard
              label="Active Branches"
              value={String(data.summary.activeBranchCount)}
              color="green"
            />
          </div>

          {isAdmin && data.byBranch.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                    <tr>
                      <th className="text-left py-3 px-4">Branch</th>
                      <th className="text-center py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">
                        Current Monthly Rent
                      </th>
                      <th className="text-center py-3 px-4">History</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.byBranch.map((b) => (
                      <>
                        <tr
                          key={b._id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() =>
                            setExpandedBranch(
                              expandedBranch === b._id ? null : b._id,
                            )
                          }
                        >
                          <td className="py-3 px-4 font-medium text-gray-800">
                            {b.branchName}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                b.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {b.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-purple-600">
                            {fmt(b.rentCost)}
                          </td>
                          <td className="py-3 px-4 text-center text-gray-400 text-xs">
                            {b.rentCostHistory.length > 0 ? (
                              <span className="inline-flex items-center gap-1">
                                {b.rentCostHistory.length} entries
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className={`transition-transform ${expandedBranch === b._id ? "rotate-180" : ""}`}
                                >
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                        {expandedBranch === b._id &&
                          b.rentCostHistory.length > 0 && (
                            <tr key={`${b._id}-history`}>
                              <td
                                colSpan={4}
                                className="bg-gray-50 px-4 pb-3 pt-1"
                              >
                                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                                  Rent Cost History — {b.branchName}
                                </p>
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="text-gray-400 uppercase">
                                      <th className="text-left py-1 pr-4">
                                        Effective From
                                      </th>
                                      <th className="text-right py-1 pr-4">
                                        Amount
                                      </th>
                                      <th className="text-left py-1">Note</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {[...b.rentCostHistory]
                                      .sort(
                                        (a, z) =>
                                          new Date(z.effectiveFrom).getTime() -
                                          new Date(a.effectiveFrom).getTime(),
                                      )
                                      .map((entry, i) => (
                                        <tr key={i}>
                                          <td className="py-1.5 pr-4 text-gray-600">
                                            {new Date(
                                              entry.effectiveFrom,
                                            ).toLocaleDateString("vi-VN")}
                                          </td>
                                          <td className="py-1.5 pr-4 text-right font-semibold text-purple-700">
                                            {fmt(entry.amount)}
                                          </td>
                                          <td className="py-1.5 text-gray-400 italic">
                                            {entry.note || "—"}
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
