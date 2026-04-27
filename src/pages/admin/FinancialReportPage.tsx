import { useState, useCallback } from "react";
import { TABS, type TabId } from "./financial-report/constants";
import { DateRangePicker } from "./financial-report/components/DateRangePicker";
import { RevenueTab } from "./financial-report/tabs/RevenueTab";
import { TopProductsTab } from "./financial-report/tabs/TopProductsTab";
import { InventoryTab } from "./financial-report/tabs/InventoryTab";
import { CouponTab } from "./financial-report/tabs/CouponTab";
import { ImportCostTab } from "./financial-report/tabs/ImportCostTab";
import { RefundTab } from "./financial-report/tabs/RefundTab";
import { LoyaltyTab } from "./financial-report/tabs/LoyaltyTab";
import { PayrollTab } from "./financial-report/tabs/PayrollTab";
import { RentCostTab } from "./financial-report/tabs/RentCostTab";
import type { FinancialReportParams } from "../../services/api/api.financial-report";

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
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 md:p-10">
      <div className="mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Financial Reports
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Revenue, profit, inventory value, and key financial metrics
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl px-4 sm:px-5 py-3 mb-5 sm:mb-6 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4">
        <span className="text-sm font-medium text-gray-600 shrink-0">
          Date Range:
        </span>
        <DateRangePicker
          from={fromDate}
          to={toDate}
          granularity={granularity}
          onChange={handleDateChange}
        />
      </div>

      {/* Tab bar - scrollable on mobile */}
      <div className="flex gap-1.5 mb-5 sm:mb-6 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors shrink-0 ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "revenue" && <RevenueTab params={params} />}
        {activeTab === "top-products" && <TopProductsTab params={params} />}
        {activeTab === "inventory" && <InventoryTab params={params} />}
        {activeTab === "coupon" && <CouponTab params={params} />}
        {activeTab === "import-cost" && <ImportCostTab params={params} />}
        {activeTab === "refund" && <RefundTab params={params} />}
        {activeTab === "loyalty" && <LoyaltyTab params={params} />}
        {activeTab === "payroll" && <PayrollTab />}
        {activeTab === "rent-cost" && <RentCostTab />}
      </div>
    </div>
  );
};

export default FinancialReportPage;
