import { useState } from "react";
import type { IAttendanceRecord } from "../../../../services/api/api.attendance";
import { STATUS_META, PAGE_SIZE } from "../constants";
import { formatTime } from "../utils";

interface AttendanceTableProps {
  records: IAttendanceRecord[];
  isLoading: boolean;
  onEdit: (record: IAttendanceRecord) => void;
}

export const AttendanceTable = ({
  records,
  isLoading,
  onEdit,
}: AttendanceTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const pagedRecords = records.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
        No attendance records found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* ── Mobile card list (< md) ── */}
      <div className="block md:hidden divide-y divide-gray-100">
        {pagedRecords.map((r) => {
          const meta = STATUS_META[r.status];
          return (
            <div key={r._id} className="p-4 space-y-2">
              {/* Employee + status */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-gray-800">
                  {typeof r.employeeId === "object"
                    ? r.employeeId?.userName
                    : r.employeeId}
                </span>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${meta?.color}`}
                >
                  {meta?.label}
                </span>
              </div>
              {/* Date + hours */}
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                <span>{r.date}</span>
                <span>In: {formatTime(r.checkInTime)}</span>
                <span>Out: {formatTime(r.checkOutTime)}</span>
                {r.workingHours != null && (
                  <span className="font-medium text-gray-700">
                    {r.workingHours.toFixed(1)}h
                  </span>
                )}
              </div>
              {r.note && (
                <div className="text-xs text-gray-400 truncate">{r.note}</div>
              )}
              {/* Edit */}
              <div className="pt-1">
                <button
                  onClick={() => onEdit(r)}
                  title="Edit"
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop table (≥ md) ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Employee
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Date
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Status
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Check-in
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Check-out
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Hours
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Note
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {pagedRecords.map((r) => (
              <tr
                key={r._id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-medium text-gray-800">
                  {typeof r.employeeId === "object"
                    ? r.employeeId?.userName
                    : r.employeeId}
                </td>
                <td className="px-4 py-3 text-gray-600">{r.date}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_META[r.status]?.color}`}
                  >
                    {STATUS_META[r.status]?.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatTime(r.checkInTime)}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatTime(r.checkOutTime)}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {r.workingHours ? r.workingHours.toFixed(1) + "h" : "—"}
                </td>
                <td className="px-4 py-3 text-gray-500 w-36 truncate">
                  {r.note || "—"}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onEdit(r)}
                    title="Edit"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 py-4 border-t border-gray-100">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
