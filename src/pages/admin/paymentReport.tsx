import { useEffect } from "react";
import PaymentManagementHeader from "../../components/admin/paymentManagement/paymentHeader";
import Pagination from "../../components/admin/paymentManagement/paymentPagination";
import PaymentStatusTabs from "../../components/admin/paymentManagement/paymentTabbar";
import PaymentOrdersTable from "../../components/admin/paymentManagement/paymentTable";
import { useAppDispatch, useAppSelector, type RootState } from "../../redux/store";
import { setPage } from "../../redux/slice/payment-management.slice";
import paymentManagementAsync from "../../redux/async-thunk/payment-management.thunk";

const PaymentReportPage = () => {
    const dispatch = useAppDispatch();
    const { orders, paymentTab, isloading, pagination } = useAppSelector(
        (state: RootState) => state.paymentManagement,
    );

    useEffect(() => {
        dispatch(
            paymentManagementAsync.ordersPaymentStatus({
                page: pagination.page,
                paymentTab,
            }),
        );
    }, [pagination.page, paymentTab]);

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
            <PaymentManagementHeader />
            {/* Tabs */}
            <PaymentStatusTabs />

            {/* Table */}
            <PaymentOrdersTable orders={orders} loading={isloading} />

            <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onChange={setPage}
            />
        </div>
    );
};
export default PaymentReportPage;
