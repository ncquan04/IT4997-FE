import type { ICategory } from "../shared/models/category-model";

export interface ICategoriesInitState {
    categories: ICategory[];
    error: boolean;
    isLoading: boolean;
}
