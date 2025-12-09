import { useNavigate } from "react-router";
import { useAuth } from "./useAuth";
import { toast } from "react-toastify";
import { defaultApi } from "../../../config/axiosDefault";

export const useLogout = () => {
  const { setUser, setIsAuth } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await defaultApi.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setUser(null);
      setIsAuth(false);
      localStorage.removeItem("isAuth");
      navigate("/login", { replace: true });
      toast.info("Logged out successfully");
    }
  };

  return { logout };
};
