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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                      <th className="text-right py-3 px-4">Monthly Rent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.byBranch.map((b) => (
                      <tr key={b._id} className="hover:bg-gray-50">
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
                      </tr>
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
