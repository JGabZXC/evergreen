import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { RegistrarAdminListResponse } from "../types/registrar.types";
import { getUsers } from "../../../shared/services/registrarService";

type QueryParams = {
  id?: string | number;
  email?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
};

export const useRegistrarUsers = (initial?: QueryParams) => {
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    limit: 10,
    ...initial,
  });

  const query = useQuery<RegistrarAdminListResponse>({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    params,
    setParams,
  } as const;
};




