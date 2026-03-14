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

const RootNavigation = () => {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route
                        path={AppRoutes.DEFAULT}
                        element={
                            <Mainlayout>
                                <HomePage />
                            </Mainlayout>
                        }
                    />
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
