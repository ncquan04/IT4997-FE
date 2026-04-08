import { Contacts } from "../../shared/contacts";
import { apiService } from "./api.config";
import type { IUser } from "../../shared/models/user-model";
import type { IBranch } from "../../shared/models/branch-model";

const API = Contacts.API_CONFIG.HR_EMPLOYEE;

export interface IEmployee extends Omit<
  IUser,
  | "password"
  | "verifyCode"
  | "memberTier"
  | "loyaltyPoints"
  | "totalSpent"
  | "spentInWindow"
  | "windowStartAt"
  | "address"
  | "branchId"
> {
  branchId?: string | IBranch;
}

export interface IEmployeeFilters {
  branchId?: string;
  role?: string;
  isActive?: boolean;
  search?: string;
}

export interface IUpdateEmployeePayload {
  role?: string;
  branchId?: string;
  baseSalary?: number;
  startDate?: number;
  isActive?: boolean;
  userName?: string;
  phoneNumber?: string;
}

export const fetchEmployees = async (
  filters?: IEmployeeFilters,
): Promise<IEmployee[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.branchId) params.append("branchId", filters.branchId);
    if (filters?.role) params.append("role", filters.role);
    if (filters?.isActive !== undefined)
      params.append("isActive", String(filters.isActive));
    if (filters?.search) params.append("search", filters.search);
    const q = params.toString();
    return await apiService.get<IEmployee[]>(
      `${API.GET_ALL.URL}${q ? "?" + q : ""}`,
    );
  } catch (error) {
    console.error("fetchEmployees error:", error);
    return [];
  }
};

export const fetchEmployeeById = async (
  id: string,
): Promise<IEmployee | null> => {
  try {
    return await apiService.get<IEmployee>(API.GET_DETAIL(id).URL);
  } catch (error) {
    console.error("fetchEmployeeById error:", error);
    return null;
  }
};

export const updateEmployee = async (
  id: string,
  payload: IUpdateEmployeePayload,
): Promise<IEmployee | null> => {
  try {
    return await apiService.put<IEmployee>(API.UPDATE(id).URL, payload);
  } catch (error) {
    console.error("updateEmployee error:", error);
    return null;
  }
};
