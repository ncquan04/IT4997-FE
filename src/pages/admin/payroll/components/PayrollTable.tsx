import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PayrollStatus } from "../../../../shared/models/payroll-model";
import type { IPayrollRecord } from "../../../../services/api/api.payroll";
import { STATUS_META, formatCurrency, getEmployeeName } from "../constants";

interface PayrollTableProps {
  records: IPayrollRecord[];
  isLoading: boolean;
  updatingId: string | null;
  bulkUpdating: boolean;
  onStatusChange: (id: string, status: PayrollStatus) => void;
  onBulkStatusChange: (from: PayrollStatus, to: PayrollStatus) => void;
}

const PayrollTable = ({
  records,
  isLoading,
  updatingId,
  bulkUpdating,
  onStatusChange,
  onBulkStatusChange,
}: PayrollTableProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  if (isLoading) {
    return <div className="p-12 text-center text-gray-500">Loading...</div>;
  }
  if (records.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500">
        No payroll records. Click "Generate Payroll" to start.
      </div>
    );
  }

  return (
    <>
      {/* ── Mobile card list (< md) ── */}
      <div className="block md:hidden divide-y divide-gray-100">
        {/* Bulk action bar */}
        {(records.some((r) => r.status === PayrollStatus.DRAFT) ||
          records.some((r) => r.status === PayrollStatus.CONFIRMED)) && (
          <div className="flex flex-wrap gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
            {records.some((r) => r.status === PayrollStatus.DRAFT) && (
              <button
                onClick={() =>
                  onBulkStatusChange(
                    PayrollStatus.DRAFT,
                    PayrollStatus.CONFIRMED,
                  )
                }
                disabled={bulkUpdating}
                className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              >
                {bulkUpdating ? "..." : "Xác nhận tất cả"}
              </button>
            )}
            {records.some((r) => r.status === PayrollStatus.CONFIRMED) && (
              <button
                onClick={() =>
                  onBulkStatusChange(
                    PayrollStatus.CONFIRMED,
                    PayrollStatus.PAID,
                  )
                }
                disabled={bulkUpdating}
                className="px-3 py-1.5 text-green-600 hover:bg-green-50 border border-green-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              >
                {bulkUpdating ? "..." : "Chi lương tất cả"}
              </button>
            )}
          </div>
        )}

        {records.map((r) => {
          const isExpanded = expandedId === r._id;
          return (
            <div key={r._id}>
              {/* Card row */}
              <div
                className="p-4 space-y-2 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : r._id)}
              >
                {/* Employee + status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-gray-800">
                    {getEmployeeName(r.employeeId)}
                  </span>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_META[r.status]?.color}`}
                  >
                    {STATUS_META[r.status]?.label}
                  </span>
                </div>
                {/* Working days + salary */}
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                  <span>
                    Ngày công: {r.workingDays}/{r.standardDays}
                  </span>
                  <span className="text-gray-400">
                    Gộp: {formatCurrency(r.grossSalary ?? r.actualSalary)}
                  </span>
                </div>
                <div className="text-sm font-semibold text-gray-800">
                  Thực lĩnh: {formatCurrency(r.actualSalary)}
                </div>
                {/* Actions */}
                <div
                  className="flex gap-2 pt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {r.status === PayrollStatus.DRAFT && (
                    <button
                      onClick={() =>
                        onStatusChange(r._id, PayrollStatus.CONFIRMED)
                      }
                      disabled={updatingId === r._id}
                      title="Xác nhận"
                      className="flex items-center gap-1 px-2.5 py-1 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Xác nhận
                    </button>
                  )}
                  {r.status === PayrollStatus.CONFIRMED && (
                    <button
                      onClick={() => onStatusChange(r._id, PayrollStatus.PAID)}
                      disabled={updatingId === r._id}
                      title="Chi lương"
                      className="flex items-center gap-1 px-2.5 py-1 text-green-600 hover:bg-green-50 border border-green-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      Chi lương
                    </button>
                  )}
                  <span className="ml-auto text-xs text-gray-400 self-center">
                    {isExpanded ? "▲ Ẩn" : "▼ Chi tiết"}
                  </span>
                </div>
              </div>
              {/* Expandable detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    key={`${r._id}-detail-mobile`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-blue-50/40 border-b border-blue-100 px-4 py-3 overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">Lương cơ bản</span>
                        <span className="font-medium">
                          {formatCurrency(r.baseSalary)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">Phụ cấp</span>
                        <span className="font-medium text-green-600">
                          +{formatCurrency(r.allowances)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">Khấu trừ</span>
                        <span className="font-medium text-red-500">
                          -{formatCurrency(r.deductions)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">BH (NLĐ)</span>
                        <span className="font-medium text-orange-500">
                          -{formatCurrency(r.employeeInsurance ?? 0)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">Thuế TNCN</span>
                        <span className="font-medium text-red-500">
                          -{formatCurrency(r.personalIncomeTax ?? 0)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">Ngày nghỉ phép</span>
                        <span className="font-medium">{r.leaveDays} ngày</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">Người phụ thuộc</span>
                        <span className="font-medium">
                          {r.dependants ?? 0} người
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">BH NSDLĐ</span>
                        <span className="font-medium text-purple-600">
                          {formatCurrency(r.employerInsurance ?? 0)}
                        </span>
                      </div>
                    </div>
                    {r.note && (
                      <p className="mt-2 text-xs text-gray-500 italic">
                        Ghi chú: {r.note}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ── Desktop table (≥ md) ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-6"></th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Nhân viên
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Ngày công
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Lương gộp
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                BH (NLĐ 10.5%)
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Thuế TNCN
              </th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700">
                Thực lĩnh
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Trạng thái
              </th>
              <th className="px-4 py-3">
                <div className="flex gap-1 justify-end">
                  {records.some((r) => r.status === PayrollStatus.DRAFT) && (
                    <button
                      onClick={() =>
                        onBulkStatusChange(
                          PayrollStatus.DRAFT,
                          PayrollStatus.CONFIRMED,
                        )
                      }
                      disabled={bulkUpdating}
                      className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {bulkUpdating ? "..." : "Xác nhận tất cả"}
                    </button>
                  )}
                  {records.some(
                    (r) => r.status === PayrollStatus.CONFIRMED,
                  ) && (
                    <button
                      onClick={() =>
                        onBulkStatusChange(
                          PayrollStatus.CONFIRMED,
                          PayrollStatus.PAID,
                        )
                      }
                      disabled={bulkUpdating}
                      className="px-2 py-1 text-green-600 hover:bg-green-50 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {bulkUpdating ? "..." : "Chi lương tất cả"}
                    </button>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => {
              const isExpanded = expandedId === r._id;
              return (
                <>
                  <motion.tr
                    key={r._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : r._id)}
                  >
                    <td className="px-4 py-3 text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {getEmployeeName(r.employeeId)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.workingDays}/{r.standardDays}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {formatCurrency(r.grossSalary ?? r.actualSalary)}
                    </td>
                    <td className="px-4 py-3 text-right text-orange-500">
                      -{formatCurrency(r.employeeInsurance ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-red-500">
                      -{formatCurrency(r.personalIncomeTax ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                      {formatCurrency(r.actualSalary)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_META[r.status]?.color}`}
                      >
                        {STATUS_META[r.status]?.label}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {r.status === PayrollStatus.DRAFT && (
                          <button
                            onClick={() =>
                              onStatusChange(r._id, PayrollStatus.CONFIRMED)
                            }
                            disabled={updatingId === r._id}
                            title="Xác nhận"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>
                        )}
                        {r.status === PayrollStatus.CONFIRMED && (
                          <button
                            onClick={() =>
                              onStatusChange(r._id, PayrollStatus.PAID)
                            }
                            disabled={updatingId === r._id}
                            title="Chi lương"
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                              <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.tr
                        key={`${r._id}-detail`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td
                          colSpan={9}
                          className="bg-blue-50/40 border-b border-blue-100 px-8 py-4"
                        >
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-2 text-xs">
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-500">
                                Lương cơ bản
                              </span>
                              <span className="font-medium">
                                {formatCurrency(r.baseSalary)}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-500">Phụ cấp</span>
                              <span className="font-medium text-green-600">
                                +{formatCurrency(r.allowances)}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-500">
                                Khấu trừ (phạt)
                              </span>
                              <span className="font-medium text-red-500">
                                -{formatCurrency(r.deductions)}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-500">
                                Ngày nghỉ phép
                              </span>
                              <span className="font-medium">
                                {r.leaveDays} ngày
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-500">
                                Người phụ thuộc
                              </span>
                              <span className="font-medium">
                                {r.dependants ?? 0} người
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-500">Mức đóng BH</span>
                              <span className="font-medium">
                                {formatCurrency(r.insuranceBase ?? 0)}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-500">
                                BH NSDLĐ (21.5%)
                              </span>
                              <span className="font-medium text-purple-600">
                                {formatCurrency(r.employerInsurance ?? 0)}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-500">
                                Thu nhập tính thuế
                              </span>
                              <span className="font-medium">
                                {formatCurrency(r.taxableIncome ?? 0)}
                              </span>
                            </div>
                          </div>
                          {r.note && (
                            <p className="mt-2 text-xs text-gray-500 italic">
                              Ghi chú: {r.note}
                            </p>
                          )}
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PayrollTable;
