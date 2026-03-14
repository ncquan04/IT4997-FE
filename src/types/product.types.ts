import type { IProduct } from "../shared/models/product-model";

export interface IProductInitState {
    products: IProduct[];
    productDetail: IProduct | null;
    error: boolean;
    isLoading: boolean;
    page?: number;
    totalPages?: number;
}
