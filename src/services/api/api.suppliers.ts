import { Contacts } from "../../shared/contacts";
import type { ISupplier } from "../../shared/models/supplier-model";
import { apiService } from "./index";

const API_PATH = Contacts.API_CONFIG;

export const fetchSuppliers = async (): Promise<ISupplier[]> => {
  try {
    return await apiService.get<ISupplier[]>(API_PATH.SUPPLIER.GET_ALL.URL);
  } catch (error) {
    console.log("Fetch suppliers error: ", error);
    return [];
  }
};