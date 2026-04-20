import { Contacts } from "../../shared/contacts";
import type { IBranch, IBranchPopulated } from "../../shared/models/branch-model";
import { apiService } from "./index";

const API_PATH = Contacts.API_CONFIG;

export const fetchBranches = async (isActive?: boolean) => {
  try {
    const params = new URLSearchParams();
    if (typeof isActive === "boolean") {
      params.append("isActive", String(isActive));
    }

    const query = params.toString();
    const endpoint = query
      ? `${API_PATH.BRANCH.GET_ALL.URL}?${query}`
      : API_PATH.BRANCH.GET_ALL.URL;

    return await apiService.get<IBranchPopulated[]>(endpoint);
  } catch (error) {
    console.log("Fetch branches error: ", error);
    return [];
  }
};

export const fetchBranchById = async (id: string) => {
  try {
    return await apiService.get<IBranchPopulated>(API_PATH.BRANCH.GET_DETAIL(id).URL);
  } catch (error) {
    console.log("Fetch branch detail error: ", error);
    return null;
  }
};

export type BranchFormData = Omit<IBranch, "_id">;

export const createBranch = async (data: BranchFormData) => {
  try {
    return await apiService.post<IBranch>(API_PATH.BRANCH.CREATE.URL, data);
  } catch (error) {
    console.log("Create branch error: ", error);
    return null;
  }
};

export const updateBranch = async (id: string, data: Partial<BranchFormData>) => {
  try {
    return await apiService.patch<IBranch>(API_PATH.BRANCH.UPDATE(id).URL, data);
  } catch (error) {
    console.log("Update branch error: ", error);
    return null;
  }
};

export const deleteBranch = async (id: string) => {
  try {
    await apiService.delete(API_PATH.BRANCH.DELETE(id).URL);
    return true;
  } catch (error) {
    console.log("Delete branch error: ", error);
    return false;
  }
};