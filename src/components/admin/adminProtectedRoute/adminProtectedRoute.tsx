import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminProtected } from "../../../services/api/api.auth";
import { AppRoutes } from "../../../navigation";

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await adminProtected();
        setIsAdmin(!!response);
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  if (isAdmin === null) {
    return <div>Checking permission...</div>;
  }

  if (isAdmin === false) {
    navigate(AppRoutes.HOME, { replace: true });
    return null;
  }
  return <>{children}</>;
};

export default AdminProtectedRoute;
