import { createAsyncThunk } from "@reduxjs/toolkit";
import type { IProduct } from "../../shared/models/product-model";
import { 
    fetchProductById, 
    fetchProducts, 
    createProduct as apiCreateProduct,
    updateProduct as apiUpdateProduct,
    deleteProduct as apiDeleteProduct
} from "../../services/api/api.products";

class ProductAsync {
    //fetch product list
    fetchProduct = createAsyncThunk<
        {
            products: IProduct[];
            page?: number;
            totalPages?: number;
        },
        { categoryId?: string; page?: number },
        { rejectValue: any }
    >(
        "product/fetch-list",
        async (payload: { categoryId?: string; page?: number }, { rejectWithValue }) => {
            try {
                const { categoryId, page } = payload;
                const response = await fetchProducts(categoryId, page);
                if (!response) {
                    throw new Error("product not found");
                }
                return {
                    products: response.products,
                    page: response.page,
                    totalPages: response.totalPages,
                };
            } catch (err) {
                console.log("fetch prodcut list error: ", err);
                return rejectWithValue({
                    error: "fetch product list error: ",
                });
            }
        },
    );
    //fetch product detail
    fetchDetail = createAsyncThunk<
        {
            productDetail: IProduct;
        },
        {
            productId: string;
        },
        { rejectValue: any }
    >("product/fetch-detail", async (payload: { productId: string }, { rejectWithValue }) => {
        try {
            const { productId } = payload;
            const productDetail = await fetchProductById(productId);
            if (!productDetail) {
                throw new Error("product not found");
            }
            return { productDetail };
        } catch (error) {
            console.log("last message screen chat error: ", error);
            return rejectWithValue({
                error: "last message screen chat error: ",
            });
        }
    });

    createProduct = createAsyncThunk<
        IProduct,
        Partial<IProduct>,
        { rejectValue: any }
    >("product/create", async (product: Partial<IProduct>, { rejectWithValue }) => {
        try {
            const response = await apiCreateProduct(product);
            return response;
        } catch (error) {
             return rejectWithValue(error);
        }
    });

    updateProduct = createAsyncThunk<
        IProduct,
        { id: string; data: Partial<IProduct> },
        { rejectValue: any }
    >("product/update", async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await apiUpdateProduct(id, data);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    });

    deleteProduct = createAsyncThunk<
        string,
        string,
        { rejectValue: any }
    >("product/delete", async (id: string, { rejectWithValue }) => {
        try {
            await apiDeleteProduct(id);
            return id;
        } catch (error) {
            return rejectWithValue(error);
        }
    });
}
const productAsync = new ProductAsync();
export default productAsync;
