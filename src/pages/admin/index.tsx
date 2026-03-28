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
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      ),
      link: AppRoutes.ADMIN_ORDERS,
      color: "bg-indigo-500",
    },
    {
      title: "Inventory Overview",
      description: "Monitor branch stock by product variant",
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
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
          <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
          <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
          <polyline points="12 22.08 12 16.9 7.5 14.3"></polyline>
          <polyline points="12 16.9 16.5 14.3"></polyline>
          <polyline points="12 6.81 12 12"></polyline>
        </svg>
      ),
      link: AppRoutes.ADMIN_INVENTORY,
      color: "bg-amber-500",
    },
    {
      title: "Stock Import Management",
      description: "Create and approve warehouse stock import receipts",
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
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
      ),
      link: AppRoutes.ADMIN_STOCK_IMPORTS,
      color: "bg-teal-500",
    },
    {
      title: "Stock Export Management",
      description: "Track outgoing stock: sales, damaged goods, and returns",
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
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="12" x2="12" y2="18"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
      ),
      link: AppRoutes.ADMIN_STOCK_EXPORTS,
      color: "bg-orange-500",
    },
    {
      title: "Warranty Management",
      description: "Receive, track repairs, and manage device warranty history",
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
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      ),
      link: AppRoutes.ADMIN_WARRANTY,
      color: "bg-purple-500",
    },
    {
      title: "Coupon Management",
      description: "Create and manage discount coupon codes",
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
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
          <line x1="7" y1="7" x2="7.01" y2="7"></line>
        </svg>
      ),
      link: AppRoutes.ADMIN_COUPONS,
      color: "bg-pink-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Select a module to manage your store.
          </p>
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
