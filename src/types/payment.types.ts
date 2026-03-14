import { Contacts } from "../shared/contacts";
import type { IProduct, IProductVariant } from "../shared/models/product-model";

const PAYMENT_METHOD = Contacts.PaymentMethod;
export interface IPaymentInitState {
    userInfo: {
        name: string;
        numberPhone: string;
        streetAddress: string;
        city: string;
    };
    order: {
        listProduct: {
            product: IProduct;
            variant: IProductVariant;
            quantity: number;
        }[];
        sumPrice: number;
        method: (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];
    };
    isLoading: boolean;
    error: boolean;
}
