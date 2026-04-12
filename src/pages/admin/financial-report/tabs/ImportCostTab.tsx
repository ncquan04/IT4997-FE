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
  ImportCostItem,
} from "../../../../services/api/api.financial-report";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { StatCard } from "../components/StatCard";
import { fmt, fmtNum, fmtTooltip } from "../utils";

export const ImportCostTab = ({ params }: { params: FinancialReportParams }) => {
  const [groupBy, setGroupBy] = useState<"supplier" | "branch">("supplier");
  const [data, setData] = useState<ImportCostItem[]>([]);
  const [summary, setSummary] = useState<{ totalCost: number; importCount: number }>({
    totalCost: 0,
    importCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    financialReportApi
      .getImportCost({ ...params, groupBy })
      .then((r) => {
        setData(r.data);
        setSummary(r.summary);
      })
      .finally(() => setLoading(false));
  }, [params, groupBy]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 gap-4 flex-1 mr-6">
          <StatCard label="Total Import Cost" value={fmt(summary.totalCost || 0)} color="red" />
          <StatCard label="Import Receipts" value={fmtNum(summary.importCount || 0)} color="blue" />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setGroupBy("supplier")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${groupBy === "supplier" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            By Supplier
          </button>
          <button
            onClick={() => setGroupBy("branch")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${groupBy === "branch" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            By Branch
          </button>
        </div>
      </div>

      {data.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(v) => (v / 1e6).toFixed(0) + "M"} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11 }} />
              <Tooltip formatter={fmtTooltip} />
              <Bar dataKey="totalCost" name="Cost" fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="text-left py-3 px-4">{groupBy === "supplier" ? "Supplier" : "Branch"}</th>
              <th className="text-right py-3 px-4">Imports</th>
              <th className="text-right py-3 px-4">Total Units</th>
              <th className="text-right py-3 px-4">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((row) => (
              <tr key={String(row._id)} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-800">{row.name || "—"}</td>
                <td className="py-3 px-4 text-right text-gray-600">{row.importCount}</td>
                <td className="py-3 px-4 text-right text-gray-600">{fmtNum(row.totalItems)}</td>
                <td className="py-3 px-4 text-right text-red-700 font-medium">{fmt(row.totalCost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
