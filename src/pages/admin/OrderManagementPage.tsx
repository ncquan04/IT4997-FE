import { useEffect, useState } from "react";
import OrderTable from "../../components/admin/OrderTable";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import orderAsync from "../../redux/async-thunk/order.thunk";
import { useToast } from "../../contexts/ToastContext";
import { Contacts } from "../../shared/contacts";

const OrderManagementPage = () => {
    const dispatch = useAppDispatch();
    const { adminOrders, isloading } = useAppSelector((state) => state.order);
    const { showToast } = useToast();
    
    // Local state for filters
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");

    const loadData = async (page: number) => {
        try {
            await dispatch(orderAsync.fetchAllOrders({ 
                page, 
                limit: 10,
                status: statusFilter === "ALL" ? undefined : (statusFilter as any),
                search: searchTerm || undefined
            })).unwrap();
        } catch (error) {
            console.error("Error loading orders:", error);
            showToast("Error loading orders", "error");
        }
    };

    useEffect(() => {
        loadData(1);
    }, [dispatch, statusFilter]); // Reload when status filter changes

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadData(1);
    };

    const handleStatusChange = async (id: string, status: number) => {
        try {
            await dispatch(orderAsync.updateOrder({ orderId: id, status })).unwrap();
            showToast("Order status updated", "success");
            loadData(adminOrders.pagination.page);
        } catch (error) {
            showToast("Failed to update status", "error");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Order Management</h1>
                        <p className="text-gray-500 mt-1">Track and manage customer orders.</p>
                    </div>
                    
                    <div className="flex gap-4">
                         {/* Filter by Status */}
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="ALL">All Status</option>
                            {Object.entries(Contacts.Status.Order).map(([key, value]) => (
                                <option key={key} value={value}>{key}</option>
                            ))}
                        </select>

                         {/* Search */}
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Search by Order ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                            />
                             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </form>
                    </div>
                </div>

                <OrderTable
                    orders={adminOrders.data}
                    isLoading={isloading}
                    currentPage={adminOrders.pagination.page}
                    totalPages={adminOrders.pagination.totalPages}
                    onPageChange={loadData}
                    onStatusChange={handleStatusChange}
                />
            </div>
        </div>
    );
};

export default OrderManagementPage;
