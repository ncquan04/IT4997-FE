import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { financialReportApi } from "../../../../services/api/api.financial-report";
import type {
  FinancialReportParams,
  CouponSummary,
  CouponItem,
} from "../../../../services/api/api.financial-report";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { StatCard } from "../components/StatCard";
import { fmt, fmtTooltip } from "../utils";
import { PIE_COLORS } from "../constants";

export const CouponTab = ({ params }: { params: FinancialReportParams }) => {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
