import { useQuery } from "@tanstack/react-query";
import { getAdminTransactions } from "./server";

export const transactionKeys = {
	all: ["admin-transactions"] as const,
	list: (params: any) => ["admin-transactions", "list", params] as const,
};

export function useAdminTransactions(params: {
	page: number;
	limit: number;
	searchQuery?: string;
	statusFilter?: string;
}) {
	return useQuery({
		queryKey: transactionKeys.list(params),
		queryFn: async () => {
			const result = await getAdminTransactions(params);
			if (result.error) throw new Error(result.error);
			return result; // Returns { data, totalCount }
		},
	});
}
