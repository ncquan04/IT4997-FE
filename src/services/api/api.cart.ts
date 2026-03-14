import { apiService } from "./api.config";
import type { ICart } from "../../shared/models/cart-model";
import type { IProductVariant } from "../../shared/models/product-model";
import { Contacts } from "../../shared/contacts";

export interface ICartResponseItem {
  _id: string;
  userId: string;
  quantity: number;
  product: {
    _id: string;
    title: string;
    brand: string;
    selectedVariant: IProductVariant | null;
  };
}

export const getCart = async (): Promise<{
  success: boolean;
  data: ICartResponseItem[];
}> => {
  return apiService.get<{ success: boolean; data: ICartResponseItem[] }>(
    Contacts.API_CONFIG.CART.BASE
  );
};

export const addToCart = async (
  productId: string,
  variantId: string,
  quantity: number = 1
): Promise<{ message: string; data: ICart }> => {
  return apiService.post<{ message: string; data: ICart }>(
    Contacts.API_CONFIG.CART.BASE,
    {
      productId,
      variantId,
      quantity,
    }
  );
};

export const updateQuantity = async (
  productId: string,
  variantId: string,
  quantity: number
): Promise<{ message: string; data?: ICart }> => {
  return apiService.patch<{ message: string; data?: ICart }>(
    Contacts.API_CONFIG.CART.BASE,
    { productId, variantId, quantity }
  );
};

export const removeFromCart = async (
  productId: string,
  variantId: string
): Promise<{ message: string }> => {
  return apiService.delete<{ message: string }>(Contacts.API_CONFIG.CART.BASE, {
    data: { productId, variantId },
  });
};
