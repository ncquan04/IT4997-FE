import { Contacts } from "../../shared/contacts";
import type { IOrder, IProductItem } from "../../shared/models/order-model";
import type { IPayment } from "../../shared/models/payment-model";
import type { PaginationType } from "../../types/payment-management.types";
import { apiService } from "./api.config";

const API_PATH = Contacts.API_CONFIG;
const STATUS_ORDER = Contacts.Status.Order;

export const createOrderBuyNow = async ({
  listProduct,
  sumPrice,
  toAddress,
  numberPhone,
  userName,
}: {
  listProduct: IProductItem[];
  sumPrice: number;
  toAddress: string;
  numberPhone: string;
  userName: string;
}) => {
  try {
    const response = await apiService.post<IOrder>(API_PATH.ORDER.BUY_NOW.URL, {
      listProduct,
      sumPrice,
      toAddress,
      numberPhone,
      userName,
    });
    return response;
  } catch (err: any) {
    console.log("Create order buy now error: ", err);
    return null;
  }
};

export const userOrderVisible = async () => {
  try {
    const response = await apiService.get<(IOrder & { payment: IPayment })[]>(
      API_PATH.ORDER.VISIBLE.URL
    );
    return response;
  } catch (err: any) {
    console.log("user visible order error: ", err);
    return null;
  }
};

export const getUserCancelledOrders = async () => {
  try {
    const response = await apiService.get<(IOrder & { payment: IPayment })[]>(
      API_PATH.ORDER.CANCEL_ORDER.URL
    );
    return response;
  } catch (err: any) {
    console.log("get user cancel order ", err);
    return null;
  }
};

export const getUserReturnedOrders = async () => {
  try {
    const response = await apiService.get<(IOrder & { payment: IPayment })[]>(
      API_PATH.ORDER.RETURN_ORDER.URL
    );
    return response;
  } catch (err: any) {
    console.log("get user cancel order ", err);
    return null;
  }
};

export const getOrderPaymentStatus = async ({
  page,
  paymentStatus,
  search,
}: {
  page: number;
  paymentStatus: number;
  search?: string;
}) => {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("page", page.toString());
    params.append("paymentStatus", paymentStatus.toString());

    const response = await apiService.get<{
      data: (IOrder & { payment: IPayment })[];
      pagination: PaginationType;
    }>(API_PATH.ORDER.ORDER_PAYMENT_STATUS.URL + "?" + params.toString());
    return response;
  } catch (err) {
    console.log("get order payment status error: ", err);
  }
};

// ADMIN
export const getAllOrders = async ({
  page,
  limit,
  search,
  status,
}: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}) => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (search) params.append("search", search);
    if (status) params.append("status", status);

    const response = await apiService.get<{
      message: string;
      data: {
        orders: (IOrder & {
          payment: IPayment;
          userId: {
            _id: string;
            email: string;
            fullName: string;
            phone: string;
          };
        })[];
        total: number;
        currentPage: number;
        totalPages: number;
        itemsPerPage: number;
      };
    }>(API_PATH.ORDER.ALL_ORDER.URL + "?" + params.toString());

    if (response && response.data && response.data.orders.length > 0) {
      return {
        data: response.data.orders,
        pagination: {
          page: response.data.currentPage,
          limit: response.data.itemsPerPage,
          total: response.data.total,
          totalPages: response.data.totalPages,
        },
      };
    }
    return {
      data: [],
      pagination: {
        page: page,
        limit: limit,
        total: 0,
        totalPages: 0,
      },
    };
  } catch (err) {
    console.log("get all orders error: ", err);
    return null;
  }
};

export const putChangeOrderStatus = async ({
  orderId,
  statusOrder,
}: {
  orderId: string;
  statusOrder: (typeof STATUS_ORDER)[keyof typeof STATUS_ORDER];
}) => {
  try {
    const response = await apiService.put<boolean>(
      API_PATH.ORDER.CHANGE_ORDER_STATUS.URL,
      {
        orderId,
        statusOrder,
      }
    );
    return response;
  } catch (err) {
    console.log("update order status error: ", err);
    return null;
  }
};

export const getUserDeliveryOrdres = async () => {
    try {
        const response = await apiService.get<(IOrder & { payment: IPayment })[]>(
            API_PATH.ORDER.DELIVERY_ORDER.URL,
        );
        return response;
    } catch (err: any) {
        console.log("get user cancel order ", err);
        return null;
    }
};
