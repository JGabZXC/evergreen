import { Outlet, useNavigate } from "react-router";
import { useAuth } from "../hooks";
import { apiPrivate } from "../../../config/axiosPrivate";
import { useEffect, useState } from "react";
import {type RefreshResponse} from "../types";
import Loading from "../../../shared/components/Loading";

export function PersistLogin() {
  const [loading, setLoading] = useState(true);
  const { user, setUser, isAuth, setIsAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function verifyRefreshToken() {
      try {
        const response = await apiPrivate.post<RefreshResponse>(
          "/api/auth/refresh-token"
        );

        if (isMounted && response.data) {
          const user = response.data;

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

    if (!user?.id && isAuth) {
      verifyRefreshToken();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return <>{loading ? <Loading /> : <Outlet />}</>;
}
