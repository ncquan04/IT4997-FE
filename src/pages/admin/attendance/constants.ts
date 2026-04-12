export const STATUS_META: Record<string, { label: string; color: string }> = {
  PRESENT: { label: "Present", color: "bg-green-100 text-green-700" },
  ABSENT: { label: "Absent", color: "bg-red-100 text-red-600" },
  LATE: { label: "Late", color: "bg-yellow-100 text-yellow-700" },
  HALF_DAY: { label: "Half Day", color: "bg-orange-100 text-orange-700" },
  LEAVE: { label: "On Leave", color: "bg-blue-100 text-blue-700" },
};

export const PAGE_SIZE = 20;
