import { useQuery } from "@tanstack/react-query";
import { getAdminTransactions } from "./server";

export const transactionKeys = {
  all: ["admin-transactions"] as const,
};

export function useAdminTransactions() {
  return useQuery({
    queryKey: transactionKeys.all,
    queryFn: async () => {
      const result = await getAdminTransactions();
      if (result.error) throw new Error(result.error);
      return result.data;
    },
  });
}
