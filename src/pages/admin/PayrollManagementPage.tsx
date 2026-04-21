import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { usePayrollData } from "./payroll/hooks/usePayrollData";
import PayrollTable from "./payroll/components/PayrollTable";
import GenerateModal from "./payroll/components/GenerateModal";
import { formatCurrency } from "./payroll/constants";
import { exportPayroll } from "../../services/api/api.payroll";

const PayrollManagementPage = () => {
  const {
    user,
    isAdmin,
    month,
    setMonth,
    year,
    setYear,
    filterBranch,
    setFilterBranch,
    branches,
    records,
    isLoading,
    updatingId,
    bulkUpdating,
    totalActual,
    loadData,
    handleBulkStatusChange,
    handleStatusChange,
  } = usePayrollData();

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: "xlsx" | "csv") => {
    setExporting(true);
    try {
      await exportPayroll({ month, year, branchId: filterBranch || undefined, format });
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Payroll Management</h1>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport("xlsx")}
              disabled={exporting || records.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
            >
              {exporting ? "Exporting..." : "Export Excel"}
            </button>
            <button
              onClick={() => handleExport("csv")}
              disabled={exporting || records.length === 0}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
            >
              Export CSV
            </button>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-4 py-2 bg-button2 text-white rounded-lg text-sm hover:opacity-90 whitespace-nowrap"
            >
              + Generate Payroll
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>Month {m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          {isAdmin && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Branch</label>
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
              >
                <option value="">All</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Total Employees
            </div>
            <div className="text-2xl font-bold text-gray-800">{records.length}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Total Net Salary
            </div>
            <div className="text-2xl font-bold text-button2">{formatCurrency(totalActual)}</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <PayrollTable
            records={records}
            isLoading={isLoading}
            updatingId={updatingId}
            bulkUpdating={bulkUpdating}
            onStatusChange={handleStatusChange}
            onBulkStatusChange={handleBulkStatusChange}
          />
        </div>
      </div>

      <AnimatePresence>
        {showGenerateModal && (
          <GenerateModal
            branches={branches}
            isAdmin={isAdmin}
            currentBranchId={user?.branchId ?? ""}
            onClose={() => setShowGenerateModal(false)}
            onGenerated={() => {
              setShowGenerateModal(false);
              loadData();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PayrollManagementPage;
