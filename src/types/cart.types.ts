import type { ICartResponseItem } from "../services/api/api.cart";

export interface ICartInitState {
  cartItems: ICartResponseItem[];
  totalPrice: number;
  isLoading: boolean;
  error: boolean;
}
