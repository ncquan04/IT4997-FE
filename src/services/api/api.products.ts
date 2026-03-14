import { Contacts } from "../../shared/contacts";
import { apiService } from "./api.config";
import type { IProduct } from "../../shared/models/product-model";

const API_PATH = Contacts.API_CONFIG;

export const fetchProducts = async (categoryId?: string, page?: number) => {
  try {
    const params = new URLSearchParams();

    if (categoryId) params.append("idCategory", categoryId);
    if (page) params.append("page", String(page));

    const response = await apiService.get<{
      data: IProduct[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`${API_PATH.PRODUCT.GET_ALL.URL}?${params.toString()}`);

    return {
      products: response.data,
      page: response.pagination?.page || 1,
      totalPages: response.pagination?.totalPages || 1,
    };
  } catch (error) {
    console.log("Fetch products error: ", error);
    return null;
  }
};

export const fetchProductById = async (productId: string) => {
  try {
    const response = await apiService.get<IProduct>(
      API_PATH.PRODUCT.GET_DETAIL(productId).URL
    );
    return response;
  } catch (error) {
    console.log("Fetch product by id error: ", error);
    return null;
  }
};

export const createProduct = async (product: Partial<IProduct>) => {
    try {
        const response = await apiService.post<IProduct>(
            API_PATH.PRODUCT.CREATE.URL,
            product
        );
        return response;
    } catch (error) {
        console.log("Create product error: ", error);
        throw error;
    }
};

export const updateProduct = async (id: string, product: Partial<IProduct>) => {
    try {
        const response = await apiService.put<IProduct>(
            API_PATH.PRODUCT.UPDATE(id).URL,
            product
        );
        return response;
    } catch (error) {
        console.log("Update product error: ", error);
        throw error;
    }
};

export const changeProductStatus = async (id: string, status: number) => {
    try {
        const response = await apiService.patch<{
            message: string;
        }>(API_PATH.PRODUCT.UPDATE_STATUS(id).URL, { to: status });
        return response;
    } catch (error) {
        console.log("Change product status error: ", error);
        throw error;
    }
};

export const deleteProduct = async (id: string) => {
    return await changeProductStatus(id, Contacts.Status.Evaluation.HIDE);
};
