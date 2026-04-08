import { useQuery } from "@tanstack/react-query";
import { getAdminUsers } from "./server";

export const userKeys = {
	all: ["admin-users"] as const,
	list: (params: any) => ["admin-users", "list", params] as const,
};

export function useAdminUsers(params: {
	page: number;
	limit: number;
	searchQuery?: string;
}) {
	return useQuery({
		queryKey: userKeys.list(params),
		queryFn: async () => {
			const result = await getAdminUsers(params);
			if (result.error) throw new Error(result.error);
			return result;
		},
	});
}
