import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { AppRoutes } from "../../navigation";
import { UserRole } from "../../shared/models/user-model";
import { logEvent } from "../../utils/analytics";

const STAFF_ROLES: string[] = [
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.WAREHOUSE,
  UserRole.SALES,
  UserRole.TECHNICIAN,
];

const GoogleCallbackPage = () => {
  const { loginWithGoogle, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    loginWithGoogle()
      .then(() => {
        logEvent("login", { method: "google" });
      })
      .catch(() => {
        navigate(AppRoutes.LOGIN, { replace: true });
      });
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    if (STAFF_ROLES.includes(user.role)) {
      navigate(AppRoutes.ADMIN, { replace: true });
      return;
    }

    const from = location.state?.from;
    navigate(from?.pathname || AppRoutes.HOME, {
      replace: true,
      state: from?.state,
    });
  }, [isAuthenticated, user]);

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <p className="text-gray-500">Đang đăng nhập...</p>
    </div>
  );
};

export default GoogleCallbackPage;
