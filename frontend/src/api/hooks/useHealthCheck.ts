import { useQuery } from "@tanstack/react-query";

import { getHealthStatus } from "../employees";

export function useHealthCheck() {
  return useQuery({
    queryKey: ["health"],
    queryFn: getHealthStatus,
  });
}
