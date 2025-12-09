import { useState, useEffect, useRef } from "react";
import { defaultApi } from "../../../config/axiosDefault";
import { toast } from "react-toastify";
import { parseError } from "../../../utils/parseErrors";
import { useAuth } from "./useAuth";
import type { AuthResponse } from "../types/auth.types";
import { useLocation, useNavigate } from "react-router";

export function useLogin() {
  const { setUser, setIsAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from: string } | undefined)?.from || "/";
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setErrors({});
      const result = await defaultApi.post<AuthResponse>(
        "api/auth/login",
        {
          email,
          password,
        },
        {
          signal: abortControllerRef.current?.signal,
        }
      );

      if (result.status === 200) {
        const user =
          result.data.user.role === "student"
            ? { ...result.data.user, studentId: result.data.studentId }
            : { ...result.data.user, employeeId: result.data.employeeId };
        setUser(user);
        setIsAuth(true);
        toast.success("Login successful!");
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      if (error.name === "CanceledError" || error.code === "ERR_CANCELED")
        return;

      const parsedError = parseError(error);

      if (parsedError.global) {
        setErrors(parsedError);
        toast.error(parsedError);
      } else {
        setErrors(parsedError);
      }
      console.error("Login failed", error);
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, errors, setErrors };
}
