import { useQuery } from "@tanstack/react-query";
import { getAdminUsers } from "./server";

export const userKeys = {
  all: ["admin-users"] as const,
};

export function useAdminUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: async () => {
      const result = await getAdminUsers();
      if (result.error) throw new Error(result.error);
      return result.data;
    },
  });
}
