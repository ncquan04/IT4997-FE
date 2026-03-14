import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AppRoutes } from "../../navigation";

const AdminDashboard = () => {
    const adminModules = [
        {
            title: "Product Management",
            description: "Manage catalog, prices, and inventory",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
            ),
            link: AppRoutes.ADMIN_PRODUCTS,
            color: "bg-button2",
        },
        {
            title: "Payment Management",
            description: "View and manage orders and payment details",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7"></path>
                    <path d="M7 10l5-5 5 5"></path>
                    <line x1="12" y1="15" x2="12" y2="9"></line>
                </svg>
            ),
            link: AppRoutes.ADMIN_PAYMENTS,
            color: "bg-green-500",
        },
        {
            title: "Order Management",
            description: "Track and update order status",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            ),
            link: AppRoutes.ADMIN_ORDERS,
            color: "bg-indigo-500",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-500 mt-1">Select a module to manage your store.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {adminModules.map((module, index) => (
                        <Link to={module.link} key={index}>
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col"
                            >
                                <div
                                    className={`w-12 h-12 rounded-xl ${module.color} flex items-center justify-center text-white mb-4`}
                                >
                                    {module.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    {module.title}
                                </h3>
                                <p className="text-gray-500 text-sm">{module.description}</p>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
