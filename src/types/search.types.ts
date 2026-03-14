import type { ICategory } from "../shared/models/category-model";
import type { IProduct } from "../shared/models/product-model";

export interface ISearchProduct {
    userInput: string; // query
    categoryId?: string;
    brand?: string;
    specKey?: string;
    specValue?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
}

export interface ISearchProductResponse {
    products: IProduct[];
    page: number;
    totalPages: number;
}

export interface ISearchInitState {
    products: IProduct[];
    error: boolean;
    isLoading: boolean;
    page?: number;
    totalPages: number;
}

export interface PriceRange {
    min: number;
    max: number;
}

export interface SearchState {
    keyword: string;
    category: ICategory | null;
    price: PriceRange;
}
