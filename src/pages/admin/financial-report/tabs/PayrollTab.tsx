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
  PayrollCostSummary,
  PayrollCostBranchItem,
  PayrollCostTimeItem,
} from "../../../../services/api/api.financial-report";
import { useAuth } from "../../../../contexts/AuthContext";
import { UserRole } from "../../../../shared/models/user-model";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { StatCard } from "../components/StatCard";
import { fmt, fmtTooltip } from "../utils";

interface PayrollData {
  summary: PayrollCostSummary;
  byBranch: PayrollCostBranchItem[];
  overTime: PayrollCostTimeItem[];
}

export const PayrollTab = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<PayrollData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    financialReportApi
      .getPayrollCost({ month, year })
      .then(setData)
      .finally(() => setLoading(false));
  }, [month, year]);

  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-100 rounded-xl px-5 py-3 flex flex-wrap gap-3 items-center">
        <span className="text-sm font-medium text-gray-600">Filter:</span>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="border border-gray-200 rounded px-2 py-1 text-sm"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              Month {m}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border border-gray-200 rounded px-2 py-1 text-sm"
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : !data ? null : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              label="Employees"
              value={String(data.summary.employeeCount)}
              color="blue"
            />
            <StatCard
              label="Base Salary"
              value={fmt(data.summary.totalBaseSalary)}
              color="purple"
            />
            <StatCard
              label="Allowances"
              value={fmt(data.summary.totalAllowances)}
              color="yellow"
            />
            <StatCard
              label="Total Net Salary"
              value={fmt(data.summary.totalActualSalary)}
              color="red"
            />
          </div>

          {data.overTime.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Payroll Cost Over Time
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.overTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                  <YAxis
                    tickFormatter={(v) => (v / 1e6).toFixed(0) + "M"}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip formatter={fmtTooltip} />
                  <Bar
                    dataKey="totalActualSalary"
                    name="Net Salary"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {isAdmin && data.byBranch.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                    <tr>
                      <th className="text-left py-3 px-4">Branch</th>
                      <th className="text-right py-3 px-4">Employees</th>
                      <th className="text-right py-3 px-4">Total Net Salary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.byBranch.map((b) => (
                      <tr key={b._id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">
                          {b.branchName}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {b.employeeCount}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-red-600">
                          {fmt(b.totalActualSalary)}
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
