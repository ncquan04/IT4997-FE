import { Contacts } from "../../shared/contacts";
import { apiService } from "./api.config";
import type {
  IAttendance,
  AttendanceStatus,
} from "../../shared/models/attendance-model";

const API = Contacts.API_CONFIG.ATTENDANCE;

export interface IAttendanceRecord extends IAttendance {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  employeeId: any; // populated
}

export interface IAttendanceSummary {
  employeeId: string;
  month: number;
  year: number;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  leave: number;
  totalWorkingHours: number;
}

export interface IUpsertAttendancePayload {
  employeeId: string;
  branchId: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: number;
  checkOutTime?: number;
  note?: string;
}

export const checkIn = async (): Promise<IAttendanceRecord | null> => {
  try {
    return await apiService.post<IAttendanceRecord>(API.CHECK_IN.URL);
  } catch (error) {
    console.error("checkIn error:", error);
    return null;
  }
};

export const checkOut = async (): Promise<IAttendanceRecord | null> => {
  try {
    return await apiService.post<IAttendanceRecord>(API.CHECK_OUT.URL);
  } catch (error) {
    console.error("checkOut error:", error);
    return null;
  }
};

export const fetchAttendanceList = async (params: {
  month: number;
  year: number;
  branchId?: string;
  employeeId?: string;
}): Promise<IAttendanceRecord[]> => {
  try {
    const q = new URLSearchParams({
      month: String(params.month),
      year: String(params.year),
      ...(params.branchId ? { branchId: params.branchId } : {}),
      ...(params.employeeId ? { employeeId: params.employeeId } : {}),
    });
    return await apiService.get<IAttendanceRecord[]>(`${API.GET_ALL.URL}?${q}`);
  } catch (error) {
    console.error("fetchAttendanceList error:", error);
    return [];
  }
};

export const fetchAttendanceSummary = async (params: {
  employeeId: string;
  month: number;
  year: number;
}): Promise<IAttendanceSummary | null> => {
  try {
    const q = new URLSearchParams({
      employeeId: params.employeeId,
      month: String(params.month),
      year: String(params.year),
    });
    return await apiService.get<IAttendanceSummary>(`${API.SUMMARY.URL}?${q}`);
  } catch (error) {
    console.error("fetchAttendanceSummary error:", error);
    return null;
  }
};

export const upsertAttendance = async (
  payload: IUpsertAttendancePayload,
): Promise<IAttendanceRecord | null> => {
  try {
    return await apiService.put<IAttendanceRecord>(API.UPSERT.URL, payload);
  } catch (error) {
    console.error("upsertAttendance error:", error);
    return null;
  }
};
