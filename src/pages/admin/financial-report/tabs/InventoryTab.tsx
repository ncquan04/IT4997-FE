import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { financialReportApi } from "../../../../services/api/api.financial-report";
import type {
  FinancialReportParams,
  InventoryValueResponse,
} from "../../../../services/api/api.financial-report";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { StatCard } from "../components/StatCard";
import { fmt, fmtNum, fmtTooltip } from "../utils";

export const InventoryTab = ({ params }: { params: FinancialReportParams }) => {
  const [data, setData] = useState<InventoryValueResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    financialReportApi
      .getInventoryValue(params)
      .then(setData)
      .finally(() => setLoading(false));
  }, [params]);

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Cost Value"
          value={fmt(data.summary.totalCostValue)}
          color="blue"
        />
        <StatCard
          label="Total Retail Value"
          value={fmt(data.summary.totalSaleValue)}
          color="green"
        />
        <StatCard
          label="Total Units in Stock"
          value={fmtNum(data.summary.totalItems)}
          color="yellow"
          sub="units"
        />
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Inventory Value by Branch
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.byBranch}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="branchName" tick={{ fontSize: 11 }} />
            <YAxis
              tickFormatter={(v) => (v / 1e6).toFixed(0) + "M"}
              tick={{ fontSize: 11 }}
            />
            <Tooltip formatter={fmtTooltip} />
            <Legend />
            <Bar
              dataKey="totalCostValue"
              name="Cost Value"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="totalSaleValue"
              name="Retail Value"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="text-left py-3 px-4">Branch</th>
                <th className="text-right py-3 px-4">SKUs</th>
                <th className="text-right py-3 px-4">Cost Value</th>
                <th className="text-right py-3 px-4">Retail Value</th>
                <th className="text-right py-3 px-4">Potential Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.byBranch.map((row) => (
                <tr key={String(row._id)} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {row.branchName}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {fmtNum(row.totalItems)}
                  </td>
                  <td className="py-3 px-4 text-right text-blue-700">
                    {fmt(row.totalCostValue)}
                  </td>
                  <td className="py-3 px-4 text-right text-green-700">
                    {fmt(row.totalSaleValue)}
                  </td>
                  <td className="py-3 px-4 text-right text-purple-700 font-medium">
                    {fmt(row.totalSaleValue - row.totalCostValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
