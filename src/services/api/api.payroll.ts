import { Contacts } from "../../shared/contacts";
import { apiService } from "./index";
import api from "./index";
import type {
  IPayroll,
  PayrollStatus,
} from "../../shared/models/payroll-model";

const API = Contacts.API_CONFIG.PAYROLL;

export interface IPayrollRecord extends IPayroll {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  employeeId: any; // populated
  confirmedBy?: any;
}

export interface IGeneratePayrollPayload {
  month: number;
  year: number;
  branchId?: string;
  standardDays?: number;
  allowances?: number;
}

export const fetchPayrollList = async (params: {
  month: number;
  year: number;
  branchId?: string;
  employeeId?: string;
}): Promise<IPayrollRecord[]> => {
  try {
    const q = new URLSearchParams({
      month: String(params.month),
      year: String(params.year),
      ...(params.branchId ? { branchId: params.branchId } : {}),
      ...(params.employeeId ? { employeeId: params.employeeId } : {}),
    });
    return await apiService.get<IPayrollRecord[]>(`${API.GET_ALL.URL}?${q}`);
  } catch (error) {
    console.error("fetchPayrollList error:", error);
    return [];
  }
};

export const fetchMyPayroll = async (params?: {
  month?: number;
  year?: number;
}): Promise<IPayrollRecord[]> => {
  try {
    const q = new URLSearchParams();
    if (params?.month) q.append("month", String(params.month));
    if (params?.year) q.append("year", String(params.year));
    return await apiService.get<IPayrollRecord[]>(
      `${API.MY.URL}${q.toString() ? "?" + q : ""}`,
    );
  } catch (error) {
    console.error("fetchMyPayroll error:", error);
    return [];
  }
};

export const generatePayroll = async (
  payload: IGeneratePayrollPayload,
): Promise<IPayrollRecord[]> => {
  try {
    return await apiService.post<IPayrollRecord[]>(API.GENERATE.URL, payload);
  } catch (error) {
    console.error("generatePayroll error:", error);
    return [];
  }
};

export const updatePayrollStatus = async (
  id: string,
  status: PayrollStatus,
  note?: string,
): Promise<IPayrollRecord | null> => {
  try {
    return await apiService.patch<IPayrollRecord>(API.UPDATE_STATUS(id).URL, {
      status,
      note,
    });
  } catch (error) {
    console.error("updatePayrollStatus error:", error);
    return null;
  }
};

export const exportPayroll = async (params: {
  month: number;
  year: number;
  branchId?: string;
  format: "xlsx" | "csv";
}): Promise<void> => {
  const q = new URLSearchParams({
    month: String(params.month),
    year: String(params.year),
    format: params.format,
    ...(params.branchId ? { branchId: params.branchId } : {}),
  });

  const res = await api.get(`${API.EXPORT.URL}?${q}`, { responseType: "blob" });

  const ext = params.format;
  const mimeType = ext === "xlsx"
    ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    : "text/csv;charset=utf-8;";

  const url = URL.createObjectURL(new Blob([res.data], { type: mimeType }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `payroll-${params.year}-${String(params.month).padStart(2, "0")}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
};