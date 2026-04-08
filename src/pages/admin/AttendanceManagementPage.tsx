import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { UserRole } from "../../shared/models/user-model";
import { AttendanceStatus } from "../../shared/models/attendance-model";
import type { IBranch } from "../../shared/models/branch-model";
import { fetchBranches } from "../../services/api/api.branches";
import {
  fetchEmployees,
  type IEmployee,
} from "../../services/api/api.hr-employee";
import {
  fetchAttendanceList,
  upsertAttendance,
  type IAttendanceRecord,
} from "../../services/api/api.attendance";

const STATUS_META: Record<string, { label: string; color: string }> = {
  PRESENT: { label: "Present", color: "bg-green-100 text-green-700" },
  ABSENT: { label: "Absent", color: "bg-red-100 text-red-600" },
  LATE: { label: "Late", color: "bg-yellow-100 text-yellow-700" },
  HALF_DAY: { label: "Half Day", color: "bg-orange-100 text-orange-700" },
  LEAVE: { label: "On Leave", color: "bg-blue-100 text-blue-700" },
};

const formatTime = (ts?: number) => {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Upsert Modal ─────────────────────────────────────────────────────────────
interface UpsertModalProps {
  record?: IAttendanceRecord;
  employees: IEmployee[];
  branchId: string;
  onClose: () => void;
  onSaved: () => void;
}

const UpsertModal = ({
  record,
  employees,
  branchId,
  onClose,
  onSaved,
}: UpsertModalProps) => {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    employeeId: record
      ? typeof record.employeeId === "object"
        ? record.employeeId._id
        : record.employeeId
      : "",
    branchId: record?.branchId ?? branchId,
    date: record?.date ?? new Date().toISOString().split("T")[0],
    status: record?.status ?? AttendanceStatus.PRESENT,
    checkInTime: record?.checkInTime
      ? new Date(record.checkInTime).toTimeString().slice(0, 5)
      : "",
    checkOutTime: record?.checkOutTime
      ? new Date(record.checkOutTime).toTimeString().slice(0, 5)
      : "",
    note: record?.note ?? "",
  });
  const [saving, setSaving] = useState(false);

  const toTimestamp = (
    dateStr: string,
    timeStr: string,
  ): number | undefined => {
    if (!timeStr) return undefined;
    return new Date(`${dateStr}T${timeStr}:00`).getTime();
  };

  const handleSave = async () => {
    if (!form.employeeId || !form.date || !form.status) {
      showToast("Please fill in all required fields", "error");
      return;
    }
    setSaving(true);
    const result = await upsertAttendance({
      employeeId: form.employeeId,
      branchId: form.branchId,
      date: form.date,
      status: form.status as AttendanceStatus,
      checkInTime: toTimestamp(form.date, form.checkInTime),
      checkOutTime: toTimestamp(form.date, form.checkOutTime),
      note: form.note || undefined,
    });
    setSaving(false);
    if (result) {
      showToast("Attendance record saved", "success");
      onSaved();
    } else {
      showToast("Save failed", "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
      >
        <h3 className="text-lg font-semibold mb-4">
          {record ? "Edit" : "Add"} Attendance
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Employee
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.employeeId}
              onChange={(e) =>
                setForm((f) => ({ ...f, employeeId: e.target.value }))
              }
              disabled={!!record}
            >
              <option value="">-- Select employee --</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.userName} ({e.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Date
            </label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              disabled={!!record}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Status
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: e.target.value as AttendanceStatus,
                }))
              }
            >
              {Object.entries(STATUS_META).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Check-in
              </label>
              <input
                type="time"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.checkInTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, checkInTime: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Check-out
              </label>
              <input
                type="time"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.checkOutTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, checkOutTime: e.target.value }))
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Note
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="Optional..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm rounded-lg bg-button2 text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AttendanceManagementPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [filterBranch, setFilterBranch] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");

  const [branches, setBranches] = useState<IBranch[]>([]);
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [records, setRecords] = useState<IAttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<
    IAttendanceRecord | undefined
  >(undefined);

  const loadBranchesAndEmployees = useCallback(async () => {
    const [branchList, empList] = await Promise.all([
      isAdmin ? fetchBranches() : Promise.resolve([]),
      fetchEmployees({ branchId: filterBranch || undefined }),
    ]);
    if (isAdmin) setBranches(branchList);
    setEmployees(empList);
  }, [isAdmin, filterBranch]);

  const loadAttendance = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchAttendanceList({
      month,
      year,
      branchId: filterBranch || undefined,
      employeeId: filterEmployee || undefined,
    });
    setRecords(data);
    setIsLoading(false);
  }, [month, year, filterBranch, filterEmployee]);

  useEffect(() => {
    loadBranchesAndEmployees();
  }, [loadBranchesAndEmployees]);
  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  // Thống kê tóm tắt
  const summary = records.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const branchIdForModal = filterBranch || user?.branchId || "";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Attendance Tracking
          </h1>
          <button
            onClick={() => {
              setEditingRecord(undefined);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-button2 text-white rounded-lg text-sm hover:opacity-90"
          >
            + Add Record
          </button>
        </div>

        {/* Bộ lọc */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Month
            </label>
            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  Month {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Year
            </label>
            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          {isAdmin && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Branch
              </label>
              <select
                className="border rounded-lg px-3 py-2 text-sm"
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
              >
                <option value="">All</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Employee
            </label>
            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
            >
              <option value="">All</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.userName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Thống kê nhanh */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          {Object.entries(STATUS_META).map(([k, v]) => (
            <div
              key={k}
              className="bg-white rounded-xl border shadow-sm p-3 text-center"
            >
              <div className="text-2xl font-bold text-gray-800">
                {summary[k] ?? 0}
              </div>
              <div
                className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${v.color}`}
              >
                {v.label}
              </div>
            </div>
          ))}
        </div>

        {/* Bảng */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500">Loading...</div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No attendance records found.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
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
                {records.map((r) => (
                  <tr key={r._id} className="border-b hover:bg-gray-50">
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
                    <td className="px-4 py-3 text-gray-500 w-[150px] truncate">
                      {r.note || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setEditingRecord(r);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <UpsertModal
          record={editingRecord}
          employees={employees}
          branchId={branchIdForModal}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            loadAttendance();
          }}
        />
      )}
    </div>
  );
};

export default AttendanceManagementPage;
