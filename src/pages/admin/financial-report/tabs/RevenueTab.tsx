import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
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
  RevenueTimeItem,
  RevenueBranchItem,
  PayrollCostSummary,
  RentCostSummary,
} from "../../../../services/api/api.financial-report";
import { useAuth } from "../../../../contexts/AuthContext";
import { UserRole } from "../../../../shared/models/user-model";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { StatCard } from "../components/StatCard";
import { fmt, fmtNum, fmtTooltip } from "../utils";

export const RevenueTab = ({ params }: { params: FinancialReportParams }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  const [timeData, setTimeData] = useState<RevenueTimeItem[]>([]);
  const [branchData, setBranchData] = useState<RevenueBranchItem[]>([]);
  const [payrollSummary, setPayrollSummary] =
    useState<PayrollCostSummary | null>(null);
  const [rentSummary, setRentSummary] = useState<RentCostSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const calls: Promise<unknown>[] = [
      financialReportApi
        .getRevenueOverTime(params)
        .then((r) => setTimeData(r.data)),
      financialReportApi
        .getPayrollCost(params)
        .then((r) => setPayrollSummary(r.summary)),
      financialReportApi.getRentCost().then((r) => setRentSummary(r.summary)),
    ];
    if (isAdmin) {
      calls.push(
        financialReportApi
          .getRevenueByBranch(params)
          .then((r) => setBranchData(r.data)),
      );
    }
    Promise.all(calls).finally(() => setLoading(false));
  }, [params, isAdmin]);

  if (loading) return <LoadingSpinner />;

  const totalRevenue = timeData.reduce((s, d) => s + d.totalRevenue, 0);
  const totalProfit = timeData.reduce((s, d) => s + d.grossProfit, 0);
  const totalDiscount = timeData.reduce((s, d) => s + d.totalDiscount, 0);
  const totalOrders = timeData.reduce((s, d) => s + d.orderCount, 0);
  const totalPayroll = payrollSummary?.totalActualSalary ?? 0;

  const months =
    params.from && params.to
      ? Math.max(
          1,
          Math.round((params.to - params.from) / (30.44 * 24 * 60 * 60 * 1000)),
        )
      : 1;
  const totalRent = (rentSummary?.totalActiveRentCost ?? 0) * months;

  const netProfitAfterPayroll = totalProfit - totalPayroll;
  const netProfitAfterAll = netProfitAfterPayroll - totalRent;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Revenue" value={fmt(totalRevenue)} color="blue" />
        <StatCard label="Gross Profit" value={fmt(totalProfit)} color="green" />
        <StatCard
          label="Total Discounts"
          value={fmt(totalDiscount)}
          color="yellow"
        />
        <StatCard label="Orders" value={fmtNum(totalOrders)} color="purple" />
        <StatCard
          label="Payroll Cost"
          value={fmt(totalPayroll)}
          color="red"
          sub={`${payrollSummary?.employeeCount ?? 0} employees`}
        />
        <StatCard
          label="Rent Cost"
          value={fmt(totalRent)}
          color="red"
          sub={`${rentSummary?.activeBranchCount ?? 0} active branches × ${months} month${months > 1 ? "s" : ""}`}
        />
      <StatCard
          label="Net Profit"
          value={fmt(netProfitAfterAll)}
          color={netProfitAfterAll >= 0 ? "green" : "red"}
        />
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Revenue & Profit Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
            <YAxis
              tickFormatter={(v) => (v / 1e6).toFixed(0) + "M"}
              tick={{ fontSize: 11 }}
            />
            <Tooltip formatter={fmtTooltip} />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalRevenue"
              name="Revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="grossProfit"
              name="Gross Profit"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="totalDiscount"
              name="Discounts"
              stroke="#f59e0b"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 2"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {isAdmin && branchData.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Revenue by Branch
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={branchData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                tickFormatter={(v) => (v / 1e6).toFixed(0) + "M"}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="branchName"
                width={130}
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={fmtTooltip} />
              <Legend />
              <Bar
                dataKey="totalRevenue"
                name="Revenue"
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
              />
              <Bar
                dataKey="grossProfit"
                name="Gross Profit"
                fill="#10b981"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
