import { Contacts } from "../../shared/contacts";
import { apiService } from "./index";
import type { ICategory } from "../../shared/models/category-model";
const API_PATH = Contacts.API_CONFIG;

export const fetchCategories = async () => {
    try {
        const response = await apiService.get<ICategory[]>(API_PATH.CATEGORY.GET_ALL.URL);
        return response;
    } catch (error) {
        console.log("get categories error", error);
        return [];
    }
};