import { Outlet, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { apiPrivate } from "../../../config/axiosPrivate";
import { useEffect, useState } from "react";
import type { RefreshResponse } from "../types/auth.types";
import { LoaderCircle } from "lucide-react";

export function PersistLogin() {
  const [loading, setLoading] = useState(true);
  const { user, setUser, isAuth, setIsAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function verifyRefreshToken() {
      try {
        const response = await apiPrivate.post<RefreshResponse>(
          "/api/auth/refresh"
        );

        if (isMounted && response.data.user) {
          const user =
            response.data.user.role === "student"
              ? { ...response.data.user, studentId: response.data.studentId }
              : { ...response.data.user, employeeId: response.data.employeeId };
          setUser(user);
        }
      } catch (err) {
        console.error("Error refreshing token:", err);

        setIsAuth(false);
        localStorage.removeItem("isAuth");
        navigate("/login", { replace: true });
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (!user?._id && isAuth) {
      verifyRefreshToken();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      {loading ? (
        <div className="h-screen flex items-center justify-center">
          <LoaderCircle className="animate-spin h-10 w-10 text-primary" />
        </div>
      ) : (
        <Outlet />
      )}
    </>
  );
}
