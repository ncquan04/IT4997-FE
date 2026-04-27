import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AppRoutes } from "../../navigation";

type Module = {
  title: string;
  description: string;
  icon: ReactNode;
  link: string;
  color: string;
};

type Category = {
  label: string;
  accent: string;
  headerIcon: ReactNode;
  modules: Module[];
};

const AdminDashboard = () => {
  const categories: Category[] = [
    {
      label: "Catalog & Products",
      accent: "border-blue-500",
      headerIcon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
      modules: [
        {
          title: "Product Management",
          description: "Manage catalog, prices, and inventory",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          ),
          link: AppRoutes.ADMIN_PRODUCTS,
          color: "bg-blue-500",
        },
        {
          title: "Inventory Overview",
          description: "Monitor branch stock by product variant",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
              <polyline points="7.5 19.79 7.5 14.6 3 12" />
              <polyline points="21 12 16.5 14.6 16.5 19.79" />
              <polyline points="12 22.08 12 16.9 7.5 14.3" />
              <polyline points="12 16.9 16.5 14.3" />
              <polyline points="12 6.81 12 12" />
            </svg>
          ),
          link: AppRoutes.ADMIN_INVENTORY,
          color: "bg-amber-500",
        },
        {
          title: "Warranty Management",
          description:
            "Receive, track repairs, and manage device warranty history",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          ),
          link: AppRoutes.ADMIN_WARRANTY,
          color: "bg-purple-500",
        },
      ],
    },
    {
      label: "Orders & Payments",
      accent: "border-green-500",
      headerIcon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      ),
      modules: [
        {
          title: "Order Management",
          description: "Track and update order status",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          ),
          link: AppRoutes.ADMIN_ORDERS,
          color: "bg-indigo-500",
        },
        {
          title: "Payment Management",
          description: "View and manage orders and payment details",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          ),
          link: AppRoutes.ADMIN_PAYMENTS,
          color: "bg-green-500",
        },
      ],
    },
    {
      label: "Warehouse",
      accent: "border-teal-500",
      headerIcon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
      modules: [
        {
          title: "Stock Import",
          description: "Create and approve warehouse stock import receipts",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          ),
          link: AppRoutes.ADMIN_STOCK_IMPORTS,
          color: "bg-teal-500",
        },
        {
          title: "Stock Export",
          description:
            "Track outgoing stock: sales, damaged goods, and returns",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="12" x2="12" y2="18" />
              <line x1="15" y1="15" x2="9" y2="15" />
            </svg>
          ),
          link: AppRoutes.ADMIN_STOCK_EXPORTS,
          color: "bg-orange-500",
        },
      ],
    },
    {
      label: "Promotions & Loyalty",
      accent: "border-pink-500",
      headerIcon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ),
      modules: [
        {
          title: "Coupon Management",
          description: "Create and manage discount coupon codes",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          ),
          link: AppRoutes.ADMIN_COUPONS,
          color: "bg-pink-500",
        },
        {
          title: "Discount Programs",
          description:
            "Manage time-limited direct price discounts applied automatically",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9 9l6 6M15 9l-6 6" />
            </svg>
          ),
          link: AppRoutes.ADMIN_DISCOUNT_PROGRAMS,
          color: "bg-rose-500",
        },
        {
          title: "Loyalty & Membership",
          description: "Manage member tiers, discount rates, and reward points",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ),
          link: AppRoutes.ADMIN_LOYALTY,
          color: "bg-violet-500",
        },
      ],
    },
    {
      label: "HR & Operations",
      accent: "border-sky-500",
      headerIcon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      modules: [
        {
          title: "Employee Management",
          description:
            "View and edit employee details, roles, and base salaries",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          ),
          link: AppRoutes.ADMIN_EMPLOYEES,
          color: "bg-sky-500",
        },
        {
          title: "Attendance Tracking",
          description:
            "View, add, and edit employee attendance records by month",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <path d="M9 16l2 2 4-4" />
            </svg>
          ),
          link: AppRoutes.ADMIN_ATTENDANCE,
          color: "bg-cyan-500",
        },
        {
          title: "Payroll Management",
          description:
            "Generate payrolls, confirm, and manage monthly salary payments",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          ),
          link: AppRoutes.ADMIN_PAYROLL,
          color: "bg-lime-600",
        },
        {
          title: "Branch Management",
          description: "View and manage branch information and rental costs",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          ),
          link: AppRoutes.ADMIN_BRANCHES,
          color: "bg-slate-500",
        },
      ],
    },
    {
      label: "Reports & Analytics",
      accent: "border-emerald-500",
      headerIcon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
          <line x1="2" y1="20" x2="22" y2="20" />
        </svg>
      ),
      modules: [
        {
          title: "Financial Reports",
          description:
            "Revenue, profit, inventory value, coupon impact, and loyalty analytics",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
              <line x1="2" y1="20" x2="22" y2="20" />
            </svg>
          ),
          link: AppRoutes.ADMIN_FINANCIAL_REPORT,
          color: "bg-emerald-600",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Select a module to manage your store.
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-10">
          {categories.map((category) => (
            <section key={category.label}>
              {/* Category Header */}
              <div
                className={`flex items-center gap-2 mb-4 pb-3 border-b-2 ${category.accent}`}
              >
                <span className="text-gray-500">{category.headerIcon}</span>
                <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wider">
                  {category.label}
                </h2>
              </div>

              {/* Module Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.modules.map((module, idx) => (
                  <Link to={module.link} key={idx}>
                    <motion.div
                      whileHover={{
                        y: -4,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:border-gray-200 transition-colors cursor-pointer h-full flex flex-col gap-3"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg ${module.color} flex items-center justify-center text-white shrink-0`}
                      >
                        {module.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 leading-snug">
                          {module.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                          {module.description}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
