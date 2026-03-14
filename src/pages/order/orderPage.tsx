import { useEffect, useState } from "react";
import OrderList from "./component/orderlist";
import OrderSidebar from "./component/orderSideBar";
import { Contacts } from "../../shared/contacts";
import { useAppDispatch, useAppSelector, type RootState } from "../../redux/store";
import orderAsync from "../../redux/async-thunk/order.thunk";

const ORDER_STATUS = Contacts.Status.Order;

export default function OrdersPage() {
    const dispatch = useAppDispatch();
    const { orders } = useAppSelector((state: RootState) => state.order);
    const [filter, setFilter] = useState<(typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]>(
        ORDER_STATUS.PROCESSING,
    );

    useEffect(() => {
        if (filter === ORDER_STATUS.PROCESSING) {
            dispatch(orderAsync.userVisibleOrderAsync());
        } else if (filter === ORDER_STATUS.CANCELLED) {
            dispatch(orderAsync.userCancelledOrders());
        } else if (filter === ORDER_STATUS.DELIVERED) {
            dispatch(orderAsync.userDeliverydOrders());
        } else {
            dispatch(orderAsync.userReturnedOrders());
        }
    }, [filter]);

    return (
        <div
            className="
                w-full
                max-w-screen-xl
                mx-auto
                px-4 py-6
                flex
                flex-col
                md:flex-row               
                gap-6"
        >
            <OrderSidebar active={filter} onChange={setFilter} />

            <div className="flex-1 md:pl-6">
                <OrderList orders={orders} />
            </div>
        </div>
    );
}
