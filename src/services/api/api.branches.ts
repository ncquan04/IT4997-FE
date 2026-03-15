import { Contacts } from "../../shared/contacts";
import type { IBranch } from "../../shared/models/branch-model";
import { apiService } from "./api.config";

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

    return await apiService.get<IBranch[]>(endpoint);
  } catch (error) {
    console.log("Fetch branches error: ", error);
    return [];
  }
};

export const fetchBranchById = async (id: string) => {
  try {
    return await apiService.get<IBranch>(API_PATH.BRANCH.GET_DETAIL(id).URL);
  } catch (error) {
    console.log("Fetch branch detail error: ", error);
    return null;
  }
};
