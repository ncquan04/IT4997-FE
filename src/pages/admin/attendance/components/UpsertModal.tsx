import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "../../../../contexts/ToastContext";
import { AttendanceStatus } from "../../../../shared/models/attendance-model";
import { upsertAttendance, type IAttendanceRecord } from "../../../../services/api/api.attendance";
import type { IEmployee } from "../../../../services/api/api.hr-employee";
import { STATUS_META } from "../constants";

interface UpsertModalProps {
  record?: IAttendanceRecord;
  employees: IEmployee[];
  branchId: string;
  onClose: () => void;
  onSaved: () => void;
}

export const UpsertModal = ({
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

  const toTimestamp = (dateStr: string, timeStr: string): number | undefined =>
    timeStr ? new Date(`${dateStr}T${timeStr}:00`).getTime() : undefined;

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
            <label className="block text-xs font-medium text-gray-600 mb-1">Employee</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.employeeId}
              onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
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
            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              disabled={!!record}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.status}
              onChange={(e) => {
                const newStatus = e.target.value as AttendanceStatus;
                const hasTime =
                  newStatus === AttendanceStatus.PRESENT ||
                  newStatus === AttendanceStatus.LATE ||
                  newStatus === AttendanceStatus.HALF_DAY;
                setForm((f) => ({
                  ...f,
                  status: newStatus,
                  checkInTime: hasTime
                    ? f.checkInTime || (record?.checkInTime ? new Date(record.checkInTime).toTimeString().slice(0, 5) : "")
                    : "",
                  checkOutTime: hasTime
                    ? f.checkOutTime || (record?.checkOutTime ? new Date(record.checkOutTime).toTimeString().slice(0, 5) : "")
                    : "",
                }));
              }}
            >
              {Object.entries(STATUS_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Check-in</label>
              <input
                type="time"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.checkInTime}
                onChange={(e) => setForm((f) => ({ ...f, checkInTime: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Check-out</label>
              <input
                type="time"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.checkOutTime}
                onChange={(e) => setForm((f) => ({ ...f, checkOutTime: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Note</label>
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
