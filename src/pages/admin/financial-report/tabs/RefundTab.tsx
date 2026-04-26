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
import type { FinancialReportParams } from "../../../../services/api/api.financial-report";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { StatCard } from "../components/StatCard";
import { fmt, fmtNum, fmtTooltip } from "../utils";

type RefundData = Awaited<
  ReturnType<typeof financialReportApi.getRefundSummary>
>;

export const RefundTab = ({ params }: { params: FinancialReportParams }) => {
  const [data, setData] = useState<RefundData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    financialReportApi
      .getRefundSummary(params)
      .then(setData)
      .finally(() => setLoading(false));
  }, [params]);

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Total Refunded"
          value={fmt(data.summary.totalRefundAmount)}
          color="red"
        />
        <StatCard
          label="Refund Count"
          value={fmtNum(data.summary.refundCount)}
          color="yellow"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {data.byReason.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Refund Reasons
            </h3>
            <div className="space-y-2">
              {data.byReason.map((r) => (
                <div key={r._id} className="flex justify-between text-sm">
                  <span className="text-gray-700 truncate max-w-52">
                    {r._id}
                  </span>
                  <div className="flex gap-3">
                    <span className="text-gray-400">{r.count}x</span>
                    <span className="text-red-600 font-medium">
                      {fmt(r.totalAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.overTime.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Refund Trend (Monthly)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.overTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis
                  tickFormatter={(v) => (v / 1e6).toFixed(0) + "M"}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip formatter={fmtTooltip} />
                <Bar
                  dataKey="totalAmount"
                  name="Refunded"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {data.byBranch.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="text-left py-3 px-4">Branch</th>
                  <th className="text-right py-3 px-4">Count</th>
                  <th className="text-right py-3 px-4">Total Refunded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.byBranch.map((row) => (
                  <tr key={String(row._id)} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{row.branchName}</td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {row.count}
                    </td>
                    <td className="py-3 px-4 text-right text-red-700 font-medium">
                      {fmt(row.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
