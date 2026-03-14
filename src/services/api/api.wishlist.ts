import { Contacts } from "../../shared/contacts";
import { apiService } from "./api.config";
import type { IProduct } from "../../shared/models/product-model";

const WISHLIST_BASE = "api/wish-list";
const API_PATH = {
    GET: { URL: WISHLIST_BASE },
    ADD: { URL: WISHLIST_BASE },
    CHECK: (productId: string) => ({ URL: `${WISHLIST_BASE}/${productId}` }),
    REMOVE: (productId: string) => ({ URL: `${WISHLIST_BASE}/${productId}` }),
};

interface BackendWishlistItem {
    wishlistItemId: string;
    productId: string;
    title: string;
    brand: string;
    image: string | null;
    price: number;
    addedAt: string;
}

export const getWishlist = async () => {
  try {
    const response = await apiService.get<{
      success: boolean;
      data: BackendWishlistItem[];
    }>(API_PATH.GET.URL);
    
    const items = response.data.map(item => ({
        _id: item.productId,
        title: item.title,
        brand: item.brand,
        variants: [{
            _id: "variant_placeholder",
            price: item.price,
            salePrice: undefined,
            images: item.image ? [item.image] : [],
            quantity: 1,
            version: "",
            colorName: "",
            hexcode: "",
            sku: ""
        }],
        wishlistItemId: item.wishlistItemId,
        addedAt: item.addedAt,
        description: "",
        descriptionDetail: "",
        specifications: [],
        categoryId: "",
        isHide: Contacts.Status.Evaluation.PUBLIC,
        rating: 0
    })) as unknown as IProduct[];

    return items;
  } catch (error) {
    console.log("Fetch wishlist error: ", error);
    return [];
  }
};


export const addToWishlist = async (productId: string) => {
  try {
    const response = await apiService.post(API_PATH.ADD.URL, { productId });
    return response;
  } catch (error) {
    console.log("Add to wishlist error: ", error);
    throw error;
  }
};

export const removeFromWishlist = async (productId: string) => {
  try {
    const response = await apiService.delete(API_PATH.REMOVE(productId).URL);
    return response;
  } catch (error) {
    console.log("Remove from wishlist error: ", error);
    throw error;
  }
};

export const checkWishlist = async (productId: string) => {
  try {
    const response = await apiService.get<{ exists: boolean }>(
      API_PATH.CHECK(productId).URL
    );
    return response;
  } catch (error) {
    console.log("Check wishlist error: ", error);
    return { exists: false };
  }
};
