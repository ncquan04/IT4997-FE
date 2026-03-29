import { apiService } from "./api.config";
import { Contacts } from "../../shared/contacts";
import type { IDiscountProgram } from "../../shared/models/discount-program-model";

const API_PATH = Contacts.API_CONFIG.DISCOUNT_PROGRAM;

export const getAllDiscountPrograms = async (): Promise<IDiscountProgram[]> => {
  try {
    const response = await apiService.get<IDiscountProgram[]>(
      API_PATH.GET_ALL.URL,
    );
    return response ?? [];
  } catch (err) {
    console.log("getAllDiscountPrograms error:", err);
    return [];
  }
};

export const createDiscountProgram = async (
  data: Omit<IDiscountProgram, "_id">,
): Promise<IDiscountProgram> => {
  return apiService.post<IDiscountProgram>(API_PATH.CREATE.URL, data);
};

export const updateDiscountProgram = async (
  id: string,
  data: Partial<IDiscountProgram>,
): Promise<IDiscountProgram> => {
  return apiService.put<IDiscountProgram>(API_PATH.UPDATE(id).URL, data);
};

export const deleteDiscountProgram = async (id: string): Promise<void> => {
  await apiService.delete(API_PATH.DELETE(id).URL);
};
