import { Route, BrowserRouter, Routes } from "react-router-dom";
import HomePage from "../pages/home/HomePage";
import NavBar from "../components/navBar/NavBar";
import Footer from "../components/footer/Footer";
import SignUpPage from "../pages/login/LogInSignUpPage";
import LogInSignUpPage from "../pages/login/LogInSignUpPage";
import AboutPage from "../pages/about/AboutPage";
import NotFoundPage from "../pages/notFound/NotFoundPage";
import ContactPage from "../pages/contact/ContactPage";
import ProductDetailPage from "../pages/productDetail/ProductDetailPage";
import WishlistPage from "../pages/wishlist/WishlistPage";
import CheckoutPage from "../pages/checkout/CheckoutPage";
import AccountPage from "../pages/account/AccountPage";
import AdminProtectedRoute from "../components/admin/adminProtectedRoute/adminProtectedRoute";
import AdminPages from "../pages/admin";
import ProductManagementPage from "../pages/admin/ProductManagementPage";
import CartPage from "../pages/cart/CartPage";
import ProtectedRoute from "../components/common/ProtectedRoute";
import SearchPage from "../pages/searchProducts/searchPage";
import CheckoutResultPage from "../pages/checkoutResult/checkoutResultPage";
import OrdersPage from "../pages/order/orderPage";
import AdminHeader from "../components/admin/AdminHeader";
import PaymentReportPage from "../pages/admin/paymentReport";
import OrderManagementPage from "../pages/admin/OrderManagementPage";
import InventoryManagementPage from "../pages/admin/InventoryManagementPage";
import StockImportManagementPage from "../pages/admin/StockImportManagementPage";
import StockExportManagementPage from "../pages/admin/StockExportManagementPage";
import WarrantyManagementPage from "../pages/admin/WarrantyManagementPage";
import CouponManagementPage from "../pages/admin/CouponManagementPage";
import DiscountProgramManagementPage from "../pages/admin/DiscountProgramManagementPage";
import LoyaltyManagementPage from "../pages/admin/LoyaltyManagementPage";
import FinancialReportPage from "../pages/admin/FinancialReportPage";
import EmployeeManagementPage from "../pages/admin/EmployeeManagementPage";
import AttendanceManagementPage from "../pages/admin/AttendanceManagementPage";
import PayrollManagementPage from "../pages/admin/PayrollManagementPage";
import BranchManagementPage from "../pages/admin/BranchManagementPage";
import FunnelManagementPage from "../pages/admin/FunnelManagementPage";
import FunnelListPage from "../pages/admin/FunnelListPage";
import CategoryPage from "../pages/category/CategoryPage";
import AllProductsPage from "../pages/allProducts/AllProductsPage";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../shared/models/user-model";
import { usePageView } from "../hooks/usePageView";

export const AppRoutes = {
  DEFAULT: "/",
  HOME: "/home",
  ACCOUNT: "/account",
  LOGIN: "/login",
  SIGNUP: "/signup",
  CONTACT: "/contact",
  ABOUT: "/about",
  WISHLIST: "/wishlist",
  CART: "/cart",
  PRIVACY_POLICY: "/privacy-policy",
  TERMS_OF_USE: "/terms-of-use",
  FAQ: "/faq",
  PRODUCT_DETAIL: "/products/:productId",
  CHECKOUT: "/checkout",
  ADMIN: "/admin",
  ADMIN_PRODUCTS: "/admin/products",
  SEARCH: "/search",
  CHECKOUT_RESULT: "/checkout/:id",
  ORDER: "/orders",
  ADMIN_PAYMENTS: "/admin/payment-report",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_INVENTORY: "/admin/inventory",
  ADMIN_STOCK_IMPORTS: "/admin/stock-imports",
  ADMIN_STOCK_EXPORTS: "/admin/stock-exports",
  ADMIN_WARRANTY: "/admin/warranty",
  ADMIN_COUPONS: "/admin/coupons",
  ADMIN_DISCOUNT_PROGRAMS: "/admin/discount-programs",
  ADMIN_LOYALTY: "/admin/loyalty",
  ADMIN_FINANCIAL_REPORT: "/admin/financial-report",
  ADMIN_EMPLOYEES: "/admin/employees",
  ADMIN_ATTENDANCE: "/admin/attendance",
  ADMIN_PAYROLL: "/admin/payroll",
  ADMIN_BRANCHES: "/admin/branches",
  ADMIN_FUNNEL: "/admin/funnel",
  CATEGORY: "/categories/:categoryId",
  ALL_PRODUCTS: "/products",
};

const STAFF_ROLES = new Set<UserRole>([
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.WAREHOUSE,
  UserRole.SALES,
  UserRole.TECHNICIAN,
]);

const RootRedirect = () => {
  const { user } = useAuth();
  if (user && STAFF_ROLES.has(user.role)) {
    return <Navigate to={AppRoutes.ADMIN} replace />;
  }
  return (
    <Mainlayout>
      <HomePage />
    </Mainlayout>
  );
};

const Mainlayout = ({ children }: { children: any }) => {
  return (
    <>
      <NavBar />
      <div className="flex-1 flex flex-col">{children}</div>
      <Footer />
    </>
  );
};

const AdminLayout = ({ children }: { children: any }) => {
  return (
    <AdminProtectedRoute>
      <>
        <AdminHeader />
        <div>{children}</div>
      </>
    </AdminProtectedRoute>
  );
};

const PageViewTracker = () => {
  usePageView();
  return null;
};

const RootNavigation = () => {
  return (
    <>
      <BrowserRouter>
        <PageViewTracker />
        <Routes>
          <Route path={AppRoutes.DEFAULT} element={<RootRedirect />} />
          <Route
            path={AppRoutes.HOME}
            element={
              <Mainlayout>
                <HomePage />
              </Mainlayout>
            }
          />
          <Route
            path={AppRoutes.LOGIN}
            element={
              <Mainlayout>
                <LogInSignUpPage action="login" />
              </Mainlayout>
            }
          />
          <Route
            path={AppRoutes.SIGNUP}
            element={
              <Mainlayout>
                <SignUpPage action="signup" />
              </Mainlayout>
            }
          />
          <Route
            path={AppRoutes.ABOUT}
            element={
              <Mainlayout>
                <AboutPage />
              </Mainlayout>
            }
          />
          <Route
            path={AppRoutes.CONTACT}
            element={
              <Mainlayout>
                <ContactPage />
              </Mainlayout>
            }
          />
          <Route
            path={AppRoutes.PRODUCT_DETAIL}
            element={
              <Mainlayout>
                <ProductDetailPage />
              </Mainlayout>
            }
          />
          <Route
            path={AppRoutes.WISHLIST}
            element={
              <Mainlayout>
                <WishlistPage />
              </Mainlayout>
            }
          />
          <Route
            path={AppRoutes.CHECKOUT}
            element={
              <ProtectedRoute>
                <Mainlayout>
                  <CheckoutPage />
                </Mainlayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={AppRoutes.ACCOUNT}
            element={
              <Mainlayout>
                <AccountPage />
              </Mainlayout>
            }
          />
          <Route
            path={AppRoutes.CART}
            element={
              <ProtectedRoute>
                <Mainlayout>
                  <CartPage />
                </Mainlayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={AppRoutes.SEARCH}
            element={
              <Mainlayout>
                <SearchPage />
              </Mainlayout>
            }
          />
          <Route
            path={AppRoutes.CATEGORY}
            element={
              <Mainlayout>
                <CategoryPage />
              </Mainlayout>
            }
          />
          <Route
            path={AppRoutes.ALL_PRODUCTS}
            element={
              <Mainlayout>
                <AllProductsPage />
              </Mainlayout>
            }
          />
          <Route
            path={AppRoutes.CHECKOUT_RESULT}
            element={
              <Mainlayout>
                <CheckoutResultPage />
              </Mainlayout>
            }
          />
          <Route
            path={AppRoutes.ORDER}
            element={
              <Mainlayout>
                <OrdersPage />
              </Mainlayout>
            }
          />
          <Route
            path={AppRoutes.ADMIN}
            element={
              <AdminLayout>
                <AdminPages />
              </AdminLayout>
            }
          />
          <Route
            path={AppRoutes.ADMIN_PRODUCTS}
            element={
              <AdminLayout>
                <ProductManagementPage />
              </AdminLayout>
            }
          />
          <Route
            path={AppRoutes.ADMIN_PAYMENTS}
            element={
              <AdminLayout>
                <PaymentReportPage />
              </AdminLayout>
            }
          />
          <Route
            path={AppRoutes.ADMIN_ORDERS}
            element={
              <AdminLayout>
                <OrderManagementPage />
              </AdminLayout>
            }
          />
          <Route
            path={AppRoutes.ADMIN_INVENTORY}
            element={
              <AdminLayout>
                <InventoryManagementPage />
              </AdminLayout>
            }
          />
          <Route
            path={AppRoutes.ADMIN_STOCK_IMPORTS}
            element={
              <AdminLayout>
                <StockImportManagementPage />
              </AdminLayout>
            }
          />
          <Route
            path={AppRoutes.ADMIN_STOCK_EXPORTS}
            element={
              <AdminLayout>
                <StockExportManagementPage />
              </AdminLayout>
            }
          />
          <Route
            path={AppRoutes.ADMIN_WARRANTY}
            element={
              <AdminLayout>
                <WarrantyManagementPage />
              </AdminLayout>
            }
          />
          <Route
            path={AppRoutes.ADMIN_COUPONS}
            element={
              <AdminLayout>
                <CouponManagementPage />
              </AdminLayout>
            }
          />
          <Route
            path={AppRoutes.ADMIN_DISCOUNT_PROGRAMS}
            element={
              <AdminLayout>
                <DiscountProgramManagementPage />
              </AdminLayout>
            }
          />
          <Route
            path={AppRoutes.ADMIN_LOYALTY}
            element={
              <AdminLayout>
                <LoyaltyManagementPage />
              </AdminLayout>
            }
          />
          <Route
            path={AppRoutes.ADMIN_FINANCIAL_REPORT}
            element={
              <AdminLayout>
                <FinancialReportPage />
              </AdminLayout>
            }
          />
          <Route
            path={AppRoutes.ADMIN_EMPLOYEES}
            element={
              <AdminLayout>
                <EmployeeManagementPage />
              </AdminLayout>
            }
          />
          <Route
            path={AppRoutes.ADMIN_ATTENDANCE}
            element={
              <AdminLayout>
                <AttendanceManagementPage />
              </AdminLayout>
            }
          />
          <Route
            path={AppRoutes.ADMIN_PAYROLL}
            element={
              <AdminLayout>
                <PayrollManagementPage />
              </AdminLayout>
            }
          />
          <Route
            path={AppRoutes.ADMIN_BRANCHES}
            element={
              <AdminLayout>
                <BranchManagementPage />
              </AdminLayout>
            }
          />
          <Route
            path={AppRoutes.ADMIN_FUNNEL}
            element={
              <AdminLayout>
                <FunnelListPage />
              </AdminLayout>
            }
          />
          <Route
            path={`${AppRoutes.ADMIN_FUNNEL}/:funnelId`}
            element={
              <AdminLayout>
                <FunnelManagementPage />
              </AdminLayout>
            }
          />
          <Route
            path="*"
            element={
              <Mainlayout>
                <NotFoundPage />
              </Mainlayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default RootNavigation;
