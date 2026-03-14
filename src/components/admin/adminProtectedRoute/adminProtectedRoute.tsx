import { useEffect, useState } from "react";
import { adminProtected } from "../../../services/api/api.auth";

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

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
        window.location.href = "/home";
        return null;
    }
    return <>{children}</>;
};

export default AdminProtectedRoute;
