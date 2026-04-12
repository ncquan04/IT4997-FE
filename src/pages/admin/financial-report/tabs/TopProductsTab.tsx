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
  TopProductItem,
} from "../../../../services/api/api.financial-report";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { fmt, fmtNum, fmtTooltip } from "../utils";

export const TopProductsTab = ({ params }: { params: FinancialReportParams }) => {
  const [data, setData] = useState<TopProductItem[]>([]);
  const [sortBy, setSortBy] = useState<"totalRevenue" | "grossProfit">("totalRevenue");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    financialReportApi
      .getTopProducts({ ...params, limit: 20 })
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [params]);

  if (loading) return <LoadingSpinner />;

  const sorted = [...data].sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Sort by:</span>
        <button
          onClick={() => setSortBy("totalRevenue")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${sortBy === "totalRevenue" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          Revenue
        </button>
        <button
          onClick={() => setSortBy("grossProfit")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${sortBy === "grossProfit" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          Profit
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <ResponsiveContainer width="100%" height={Math.max(300, sorted.length * 36)}>
          <BarChart data={sorted} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(v) => (v / 1e6).toFixed(0) + "M"} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="title" width={180} tick={{ fontSize: 11 }} />
            <Tooltip formatter={fmtTooltip} />
            <Legend />
            <Bar dataKey="totalRevenue" name="Revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            <Bar dataKey="grossProfit" name="Gross Profit" fill="#10b981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="text-left py-3 px-4">#</th>
              <th className="text-left py-3 px-4">Product</th>
              <th className="text-right py-3 px-4">Qty Sold</th>
              <th className="text-right py-3 px-4">Revenue</th>
              <th className="text-right py-3 px-4">Gross Profit</th>
              <th className="text-right py-3 px-4">Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((item, i) => (
              <tr key={String(item._id)} className="hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-400">{i + 1}</td>
                <td className="py-3 px-4 font-medium text-gray-800">{item.title}</td>
                <td className="py-3 px-4 text-right text-gray-600">{fmtNum(item.totalQuantity)}</td>
                <td className="py-3 px-4 text-right text-blue-700 font-medium">{fmt(item.totalRevenue)}</td>
                <td className="py-3 px-4 text-right text-green-700 font-medium">{fmt(item.grossProfit)}</td>
                <td className="py-3 px-4 text-right">
                  <span className={`text-xs font-semibold ${item.grossMarginPct >= 20 ? "text-green-600" : item.grossMarginPct >= 10 ? "text-yellow-600" : "text-red-600"}`}>
                    {item.grossMarginPct.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
