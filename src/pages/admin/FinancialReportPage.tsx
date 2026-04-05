import { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { financialReportApi } from "../../services/api/api.financial-report";
import type {
  FinancialReportParams,
  TopProductItem,
  InventoryValueResponse,
  RevenueTimeItem,
  RevenueBranchItem,
  CouponSummary,
  CouponItem,
  ImportCostItem,
  LoyaltySummary,
} from "../../services/api/api.financial-report";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../shared/models/user-model";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n,
  );

const fmtNum = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

const fmtTooltip = (
  v: number | string | readonly (string | number)[] | undefined,
): string => (typeof v === "number" ? fmt(v) : String(v ?? ""));

const PIE_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

const TABS = [
  { id: "revenue", label: "Revenue" },
  { id: "top-products", label: "Top Products" },
  { id: "inventory", label: "Inventory Value" },
  { id: "coupon", label: "Promotions" },
  { id: "import-cost", label: "Import Cost" },
  { id: "refund", label: "Refunds" },
  { id: "loyalty", label: "Loyalty" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── DateRangePicker ──────────────────────────────────────────────────────────

interface DateRangePickerProps {
  from: string;
  to: string;
  granularity: "day" | "month" | "year";
  onChange: (f: string, t: string, g: "day" | "month" | "year") => void;
}

const DateRangePicker = ({
  from,
  to,
  granularity,
  onChange,
}: DateRangePickerProps) => (
  <div className="flex flex-wrap items-center gap-3">
    <div className="flex items-center gap-1">
      <label className="text-sm text-gray-500">From</label>
      <input
        type="date"
        value={from}
        className="border border-gray-200 rounded px-2 py-1 text-sm"
        onChange={(e) => onChange(e.target.value, to, granularity)}
      />
    </div>
    <div className="flex items-center gap-1">
      <label className="text-sm text-gray-500">To</label>
      <input
        type="date"
        value={to}
        className="border border-gray-200 rounded px-2 py-1 text-sm"
        onChange={(e) => onChange(from, e.target.value, granularity)}
      />
    </div>
    <select
      value={granularity}
      className="border border-gray-200 rounded px-2 py-1 text-sm"
      onChange={(e) =>
        onChange(from, to, e.target.value as "day" | "month" | "year")
      }
    >
      <option value="day">By Day</option>
      <option value="month">By Month</option>
      <option value="year">By Year</option>
    </select>
  </div>
);

// ─── StatCard ──────────────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  sub,
  color = "blue",
}: {
  label: string;
  value: string;
  sub?: string;
  color?: "blue" | "green" | "yellow" | "red" | "purple";
}) => {
  const colorMap = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
    red: "bg-red-50 border-red-200 text-red-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
  };
  return (
    <div className={`border rounded-xl p-4 ${colorMap[color]}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
  );
};

// ─── Tab: Revenue ─────────────────────────────────────────────────────────────

const RevenueTab = ({ params }: { params: FinancialReportParams }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  const [timeData, setTimeData] = useState<RevenueTimeItem[]>([]);
  const [branchData, setBranchData] = useState<RevenueBranchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const calls: Promise<unknown>[] = [
      financialReportApi
        .getRevenueOverTime(params)
        .then((r) => setTimeData(r.data)),
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Revenue" value={fmt(totalRevenue)} color="blue" />
        <StatCard label="Gross Profit" value={fmt(totalProfit)} color="green" />
        <StatCard
          label="Total Discounts"
          value={fmt(totalDiscount)}
          color="yellow"
        />
        <StatCard label="Orders" value={fmtNum(totalOrders)} color="purple" />
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

// ─── Tab: Top Products ────────────────────────────────────────────────────────

const TopProductsTab = ({ params }: { params: FinancialReportParams }) => {
  const [data, setData] = useState<TopProductItem[]>([]);
  const [sortBy, setSortBy] = useState<"totalRevenue" | "grossProfit">(
    "totalRevenue",
  );
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
        <ResponsiveContainer
          width="100%"
          height={Math.max(300, sorted.length * 36)}
        >
          <BarChart data={sorted} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              tickFormatter={(v) => (v / 1e6).toFixed(0) + "M"}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="title"
              width={180}
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
                <td className="py-3 px-4 font-medium text-gray-800">
                  {item.title}
                </td>
                <td className="py-3 px-4 text-right text-gray-600">
                  {fmtNum(item.totalQuantity)}
                </td>
                <td className="py-3 px-4 text-right text-blue-700 font-medium">
                  {fmt(item.totalRevenue)}
                </td>
                <td className="py-3 px-4 text-right text-green-700 font-medium">
                  {fmt(item.grossProfit)}
                </td>
                <td className="py-3 px-4 text-right">
                  <span
                    className={`text-xs font-semibold ${item.grossMarginPct >= 20 ? "text-green-600" : item.grossMarginPct >= 10 ? "text-yellow-600" : "text-red-600"}`}
                  >
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

// ─── Tab: Inventory Value ─────────────────────────────────────────────────────

const InventoryTab = ({ params }: { params: FinancialReportParams }) => {
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
  );
};

// ─── Tab: Coupon Impact ───────────────────────────────────────────────────────

const CouponTab = ({ params }: { params: FinancialReportParams }) => {
  const [summary, setSummary] = useState<CouponSummary | null>(null);
  const [byCoupon, setByCoupon] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    financialReportApi
      .getCouponImpact(params)
      .then((r) => {
        setSummary(r.summary);
        setByCoupon(r.byCoupon);
      })
      .finally(() => setLoading(false));
  }, [params]);

  if (loading) return <LoadingSpinner />;
  if (!summary) return null;

  const totalDiscountAll =
    (summary.totalCouponDiscount || 0) +
    (summary.totalMemberDiscount || 0) +
    (summary.totalPointsDiscount || 0);

  const pieData = [
    { name: "Coupon", value: summary.totalCouponDiscount || 0 },
    { name: "Member Tier", value: summary.totalMemberDiscount || 0 },
    { name: "Points Redemption", value: summary.totalPointsDiscount || 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Discounts"
          value={fmt(totalDiscountAll)}
          color="red"
        />
        <StatCard
          label="Coupon Discounts"
          value={fmt(summary.totalCouponDiscount || 0)}
          color="yellow"
          sub={`${summary.ordersWithCoupon} orders`}
        />
        <StatCard
          label="Member Tier Discounts"
          value={fmt(summary.totalMemberDiscount || 0)}
          color="blue"
          sub={`${summary.ordersWithMemberDiscount} orders`}
        />
        <StatCard
          label="Points Discounts"
          value={fmt(summary.totalPointsDiscount || 0)}
          color="purple"
          sub={`${summary.ordersWithPointsDiscount} orders`}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {pieData.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Discount Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip formatter={fmtTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {byCoupon.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Most Used Coupons
            </h3>
            <div className="space-y-2">
              {byCoupon.slice(0, 8).map((c) => (
                <div
                  key={c._id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                    {c._id}
                  </span>
                  <span className="text-gray-500">{c.usedCount} uses</span>
                  <span className="text-red-600 font-medium">
                    -{fmt(c.totalDiscount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Tab: Import Cost ─────────────────────────────────────────────────────────

const ImportCostTab = ({ params }: { params: FinancialReportParams }) => {
  const [groupBy, setGroupBy] = useState<"supplier" | "branch">("supplier");
  const [data, setData] = useState<ImportCostItem[]>([]);
  const [summary, setSummary] = useState<{
    totalCost: number;
    importCount: number;
  }>({ totalCost: 0, importCount: 0 });
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
          <StatCard
            label="Total Import Cost"
            value={fmt(summary.totalCost || 0)}
            color="red"
          />
          <StatCard
            label="Import Receipts"
            value={fmtNum(summary.importCount || 0)}
            color="blue"
          />
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
              <XAxis
                type="number"
                tickFormatter={(v) => (v / 1e6).toFixed(0) + "M"}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={160}
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={fmtTooltip} />
              <Bar
                dataKey="totalCost"
                name="Cost"
                fill="#ef4444"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="text-left py-3 px-4">
                {groupBy === "supplier" ? "Supplier" : "Branch"}
              </th>
              <th className="text-right py-3 px-4">Imports</th>
              <th className="text-right py-3 px-4">Total Units</th>
              <th className="text-right py-3 px-4">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((row) => (
              <tr key={String(row._id)} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-800">
                  {row.name || "—"}
                </td>
                <td className="py-3 px-4 text-right text-gray-600">
                  {row.importCount}
                </td>
                <td className="py-3 px-4 text-right text-gray-600">
                  {fmtNum(row.totalItems)}
                </td>
                <td className="py-3 px-4 text-right text-red-700 font-medium">
                  {fmt(row.totalCost)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Tab: Refund Summary ──────────────────────────────────────────────────────

const RefundTab = ({ params }: { params: FinancialReportParams }) => {
  const [refundData, setRefundData] = useState<Awaited<
    ReturnType<typeof financialReportApi.getRefundSummary>
  > | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    financialReportApi
      .getRefundSummary(params)
      .then(setRefundData)
      .finally(() => setLoading(false));
  }, [params]);

  if (loading) return <LoadingSpinner />;
  if (!refundData) return null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Total Refunded"
          value={fmt(refundData.summary.totalRefundAmount)}
          color="red"
        />
        <StatCard
          label="Refund Count"
          value={fmtNum(refundData.summary.refundCount)}
          color="yellow"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {refundData.byReason.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Refund Reasons
            </h3>
            <div className="space-y-2">
              {refundData.byReason.map((r) => (
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

        {refundData.overTime.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Refund Trend (Monthly)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={refundData.overTime}>
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

      {refundData.byBranch.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="text-left py-3 px-4">Branch</th>
                <th className="text-right py-3 px-4">Count</th>
                <th className="text-right py-3 px-4">Total Refunded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {refundData.byBranch.map((row) => (
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
      )}
    </div>
  );
};

// ─── Tab: Loyalty ─────────────────────────────────────────────────────────────

const TIER_LABELS: Record<string, string> = {
  S_NEW: "S-New",
  S_MEM: "S-Mem",
  S_CLASS: "S-Class",
};
const TIER_COLORS_MAP: Record<string, string> = {
  S_NEW: "bg-gray-100 text-gray-700",
  S_MEM: "bg-blue-100 text-blue-700",
  S_CLASS: "bg-yellow-100 text-yellow-700",
};

const LoyaltyTab = ({ params }: { params: FinancialReportParams }) => {
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
      )}
    </div>
  );
};

// ─── Loading ──────────────────────────────────────────────────────────────────

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-20 text-gray-400">
    <svg className="animate-spin h-8 w-8 mr-3" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
    <span className="text-sm">Loading data...</span>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const FinancialReportPage = () => {
  const [activeTab, setActiveTab] = useState<TabId>("revenue");
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5);
    return d.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState<string>(
    () => new Date().toISOString().split("T")[0],
  );
  const [granularity, setGranularity] = useState<"day" | "month" | "year">(
    "month",
  );

  const params: FinancialReportParams = {
    from: fromDate ? new Date(fromDate).getTime() : undefined,
    to: toDate ? new Date(toDate + "T23:59:59").getTime() : undefined,
    granularity,
  };

  const handleDateChange = useCallback(
    (f: string, t: string, g: "day" | "month" | "year") => {
      setFromDate(f);
      setToDate(t);
      setGranularity(g);
    },
    [],
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Financial Reports</h1>
        <p className="text-sm text-gray-500 mt-1">
          Revenue, profit, inventory value, and key financial metrics
        </p>
      </div>

      {/* Date Filter */}
      <div className="bg-white border border-gray-100 rounded-xl px-5 py-3 mb-6 flex items-center gap-4">
        <span className="text-sm font-medium text-gray-600">Date Range:</span>
        <DateRangePicker
          from={fromDate}
          to={toDate}
          granularity={granularity}
          onChange={handleDateChange}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "revenue" && <RevenueTab params={params} />}
        {activeTab === "top-products" && <TopProductsTab params={params} />}
        {activeTab === "inventory" && <InventoryTab params={params} />}
        {activeTab === "coupon" && <CouponTab params={params} />}
        {activeTab === "import-cost" && <ImportCostTab params={params} />}
        {activeTab === "refund" && <RefundTab params={params} />}
        {activeTab === "loyalty" && <LoyaltyTab params={params} />}
      </div>
    </div>
  );
};

export default FinancialReportPage;
