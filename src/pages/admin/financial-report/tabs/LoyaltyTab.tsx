import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { financialReportApi } from "../../../../services/api/api.financial-report";
import type {
  FinancialReportParams,
  LoyaltySummary,
} from "../../../../services/api/api.financial-report";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { StatCard } from "../components/StatCard";
import { fmt, fmtNum } from "../utils";
import { TIER_LABELS, TIER_COLORS_MAP } from "../constants";

export const LoyaltyTab = ({ params }: { params: FinancialReportParams }) => {
  const [data, setData] = useState<LoyaltySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    financialReportApi
      .getLoyaltySummary(params)
      .then(setData)
      .finally(() => setLoading(false));
  }, [params]);

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const earnRow = data.byType.find((t) => t._id === "EARN");
  const redeemRow = data.byType.find((t) => t._id === "REDEEM");
  const expireRow = data.byType.find((t) => t._id === "EXPIRE");
  const totalUsers = data.tierDist.reduce((s, t) => s + t.userCount, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Points Issued"
          value={fmtNum(earnRow?.totalPoints ?? 0)}
          color="green"
          sub={`${earnRow?.transactionCount ?? 0} transactions`}
        />
        <StatCard
          label="Points Redeemed"
          value={fmtNum(Math.abs(redeemRow?.totalPoints ?? 0))}
          color="blue"
          sub={`${redeemRow?.transactionCount ?? 0} transactions`}
        />
        <StatCard
          label="Points Expired"
          value={fmtNum(Math.abs(expireRow?.totalPoints ?? 0))}
          color="red"
          sub={`${expireRow?.transactionCount ?? 0} transactions`}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Customer Distribution by Tier
          </h3>
          {data.tierDist.map((t) => (
            <div key={t._id} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${TIER_COLORS_MAP[t._id] ?? "bg-gray-100 text-gray-700"}`}
                >
                  {TIER_LABELS[t._id] ?? t._id}
                </span>
                <span className="text-gray-500 text-xs">
                  {t.userCount} customers (
                  {totalUsers > 0
                    ? ((t.userCount / totalUsers) * 100).toFixed(0)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width:
                      totalUsers > 0
                        ? `${(t.userCount / totalUsers) * 100}%`
                        : "0%",
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Avg. spent: {fmt(t.avgTotalSpent)}
              </p>
            </div>
          ))}
        </div>

        {data.overTime.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Points Issued (Monthly)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.overTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis
                  tickFormatter={(v) => fmtNum(v)}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar
                  dataKey="pointsEarned"
                  name="Points Issued"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {data.tierConfigs.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="text-left py-3 px-4">Tier</th>
                  <th className="text-right py-3 px-4">Min. Spent</th>
                  <th className="text-right py-3 px-4">Discount</th>
                  <th className="text-right py-3 px-4">Customers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.tierConfigs.map((tc) => {
                  const dist = data.tierDist.find((t) => t._id === tc.tier);
                  return (
                    <tr key={tc.tier} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${TIER_COLORS_MAP[tc.tier] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {TIER_LABELS[tc.tier] ?? tc.tier}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {fmt(tc.minSpent)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-green-700">
                        {tc.discountPercent}%
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {dist?.userCount ?? 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
